"""
AgentFlow AI Engine - Complete Orchestrator with FastAPI
Coordinates task execution across specialized agents with full persistence
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from enum import Enum
import uuid
import asyncio

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from orchestrator.orchestrator import Orchestrator


import psycopg2
from psycopg2.extras import RealDictCursor
import redis
import aio_pika

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== Configuration ==========
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'agentflow')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', '6379'))

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
COHERE_API_KEY = os.getenv('COHERE_API_KEY')
COHERE_MODEL = os.getenv('COHERE_MODEL', 'command-xlarge-nightly')
AI_TIMEOUT = int(os.getenv('AI_TIMEOUT', '60'))

AGENT_ROLE_BY_NAME = {
    'Planner': 'Strategic Planner',
    'Researcher': 'Research Specialist',
    'Developer': 'Full-Stack Developer',
    'Tester': 'QA & Testing',
    'Reporter': 'Reporting & Delivery'
}

# ========== RabbitMQ Connection ==========
rabbitmq_connection = None
rabbitmq_channel = None

async def get_rabbitmq_connection():
    global rabbitmq_connection, rabbitmq_channel
    if not rabbitmq_connection:
        rabbitmq_connection = await aio_pika.connect_robust(
            f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASSWORD}@{RABBITMQ_HOST}/"
        )
        rabbitmq_channel = await rabbitmq_connection.channel()
        await rabbitmq_channel.set_qos(prefetch_count=1)
    return rabbitmq_channel

# ========== Database Utilities ==========
class DatabaseConnection:
    @staticmethod
    def get_connection():
        """Get database connection"""
        try:
            conn_string = (
                f"host={DB_HOST} "
                f"port={DB_PORT} "
                f"dbname={DB_NAME} "
                f"user={DB_USER} "
                f"password={DB_PASSWORD}"
            )
            return psycopg2.connect(conn_string)
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

# ========== Redis Client ==========
try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
        db=0
    )
    redis_client.ping()
    logger.info("Connected to Redis")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}")
    redis_client = None

# ========== Models ==========
class TaskRequest(BaseModel):
    input: str
    agent_selection: Optional[List[str]] = None

class TaskResponse(BaseModel):
    task_id: str
    status: str
    created_at: str

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    logs: List[Dict]
    agentStatus: Dict
    output: Dict
    memory: Dict

# ========== Async Lifespan ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AgentFlow AI Engine")
    init_database()
    await get_rabbitmq_connection()
    yield
    # Shutdown
    if rabbitmq_connection:
        await rabbitmq_connection.close()
    logger.info("AgentFlow AI Engine shutdown")

app = FastAPI(title="AgentFlow AI Engine", lifespan=lifespan)

# ========== CORS ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Database Initialization ==========
def init_database():
    """Initialize all required database tables"""
    conn = None
    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
            conn.commit()
        except Exception as e:
            logger.warning(f"pgvector not available: {e}")
            conn.rollback()

        # Tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id UUID PRIMARY KEY,
                input TEXT NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                output JSONB DEFAULT '{}',
                metadata JSONB DEFAULT '{}',
                CONSTRAINT task_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
            )
        """)

        # Agent logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_logs (
                id SERIAL PRIMARY KEY,
                task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                agent VARCHAR(50) NOT NULL,
                message TEXT,
                status VARCHAR(20),
                timestamp TIMESTAMP DEFAULT NOW(),
                output JSONB
            )
        """)

        # Agent status table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_status (
                id SERIAL PRIMARY KEY,
                task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                agent VARCHAR(50) NOT NULL,
                status VARCHAR(20),
                output JSONB,
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(task_id, agent)
            )
        """)

        # Memory table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory_store (
                id SERIAL PRIMARY KEY,
                task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                memory_type VARCHAR(50),
                content JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        conn.commit()
        cursor.close()
        logger.info("Database initialized successfully")

    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

# ========== Agent Engine ==========
class AgentEngine:
    """Manages agent execution and coordination"""

    WORKFLOW = [
        ('Planner', 'planner_queue'),
        ('Researcher', 'researcher_queue'),
        ('Developer', 'developer_queue'),
        ('Tester', 'tester_queue'),
        ('Reporter', 'reporter_queue'),
    ]

    @staticmethod
    def log_agent_activity(task_id: str, agent: str, message: str, status: str = 'running', output: Dict = None):
        """Log agent activity to database"""
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO agent_logs (task_id, agent, message, status, output)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (task_id, agent, message, status, json.dumps(output) if output else None)
            )
            conn.commit()
            cursor.close()
        except Exception as e:
            logger.error(f"Failed to log agent activity: {e}")
        finally:
            if conn:
                conn.close()

    @staticmethod
    def update_agent_status(task_id: str, agent: str, status: str, output: Dict = None):
        """Update agent status in database"""
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO agent_status (task_id, agent, status, output)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (task_id, agent) DO UPDATE
                SET status = EXCLUDED.status, output = EXCLUDED.output, updated_at = NOW()
                """,
                (task_id, agent, status, json.dumps(output) if output else None)
            )
            conn.commit()
            cursor.close()
        except Exception as e:
            logger.error(f"Failed to update agent status: {e}")
        finally:
            if conn:
                conn.close()

    @staticmethod
    async def publish_to_queue(queue_name: str, message: Dict):
        """Publish message to RabbitMQ queue"""
        try:
            channel = await get_rabbitmq_connection()
            await channel.declare_queue(queue_name, durable=True)
            await channel.default_exchange.publish(
                aio_pika.Message(body=json.dumps(message).encode()),
                routing_key=queue_name
            )
            logger.info(f"Published to {queue_name}: {message}")
        except Exception as e:
            logger.error(f"Failed to publish to queue {queue_name}: {e}")

    @staticmethod
    def execute_task_workflow(task_id: str, task_input: str):
        """Execute task workflow directly with status updates"""
        import asyncio
        import threading
        from orchestrator.orchestrator import Orchestrator
        
        def _execute():
            # Run the async workflow
            asyncio.run(AgentEngine._execute_async_workflow(task_id, task_input))
        
        # Run in background thread
        thread = threading.Thread(target=_execute, daemon=True)
        thread.start()

    @staticmethod
    async def _execute_async_workflow(task_id: str, task_input: str):

        """Async execution of task workflow"""
        conn = None
        try:
            # Callback to update agent status in database
 
            def on_agent_status_change(update):
                try:
                    conn_update = DatabaseConnection.get_connection()
                    cursor = conn_update.cursor()
                    
                    agent = update.get("agent", "").lower()
                    status = update.get("status", "running")
                    output = update.get("output")
                    message = update.get("message", "")
                    
                    # Update agent status
                    AgentEngine.update_agent_status(
                        task_id, agent, status, 
                        output or {"message": message}
                    )
                    
                    # Log agent activity
                    if message:
                        AgentEngine.log_agent_activity(
                            task_id, 
                            update.get("agent", "Agent").title(), 
                            message, 
                            status, 
                            output
                        )
                    
                    cursor.close()
                    conn_update.close()
                except Exception as e:
                    logger.error(f"Error updating agent status: {e}")
            
            # Initialize orchestrator with callback
            orchestrator = Orchestrator(on_agent_status_change=on_agent_status_change)
            
            # Update task status to running
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE tasks SET status = %s, updated_at = NOW() WHERE id = %s",
                ('running', task_id)
            )
            conn.commit()
            cursor.close()
            conn.close()
            
            # Log workflow start
            AgentEngine.log_agent_activity(task_id, 'Orchestrator', 'Workflow started', 'running')
            
            # Execute task with orchestrator (now async)
            task = {'id': task_id, 'input': task_input}
            result = await orchestrator.process_task(task)
            
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}", exc_info=True)
            
            # Update task status to failed
            try:
                if conn is None:
                    conn = DatabaseConnection.get_connection()
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE tasks SET status = %s, updated_at = NOW() WHERE id = %s",
                    ('failed', task_id)
                )
                conn.commit()
                cursor.close()
                
                AgentEngine.log_agent_activity(
                    task_id, 'Orchestrator', 
                    f'Workflow failed: {str(e)}', 
                    'failed'
                )
            except Exception as cleanup_error:
                logger.error(f"Failed to update task status: {cleanup_error}")
        finally:
            if conn:
                try:
                    conn.close()
                except:
                    pass

    @staticmethod
    async def start_workflow(task_id: str, task_input: str):
        """Start the workflow by executing task in background"""
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            # Update task status to running
            cursor.execute(
                "UPDATE tasks SET status = %s, updated_at = NOW() WHERE id = %s",
                ('running', task_id)
            )
            conn.commit()

            # Log workflow start
            AgentEngine.log_agent_activity(task_id, 'Orchestrator', 'Workflow started', 'running')

            # Execute task in background
            AgentEngine.execute_task_workflow(task_id, task_input)

            logger.info(f"Workflow started for task {task_id}")

        except Exception as e:
            logger.error(f"Failed to start workflow: {e}")
            if conn:
                try:
                    cursor.execute(
                        "UPDATE tasks SET status = %s, updated_at = NOW() WHERE id = %s",
                        ('failed', task_id)
                    )
                    conn.commit()
                except:
                    pass
        finally:
            if conn:
                conn.close()

# ========== API Routes ==========

@app.post("/api/task", response_model=TaskResponse)
async def create_task(request: TaskRequest, background_tasks: BackgroundTasks):
    """Create and start a new task workflow"""
    task_id = str(uuid.uuid4())
    conn = None

    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()

        # Store task in database
        cursor.execute(
            """
            INSERT INTO tasks (id, input, status)
            VALUES (%s, %s, %s)
            """,
            (task_id, request.input, 'pending')
        )
        conn.commit()
        cursor.close()

        # Start workflow in background
        background_tasks.add_task(AgentEngine.start_workflow, task_id, request.input)

        logger.info(f"Task {task_id} created and workflow started")

        return TaskResponse(
            task_id=task_id,
            status='pending',
            created_at=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """Get task status with all details"""
    conn = None
    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Get task
        cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
        task = cursor.fetchone()

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Get logs
        cursor.execute(
            "SELECT * FROM agent_logs WHERE task_id = %s ORDER BY timestamp ASC",
            (task_id,)
        )
        logs = [dict(log) for log in cursor.fetchall()]
        for log in logs:
            log['timestamp'] = log['timestamp'].isoformat() if log['timestamp'] else None

        # Get agent status
        cursor.execute(
            "SELECT agent, status, output FROM agent_status WHERE task_id = %s",
            (task_id,)
        )
        agent_statuses = {}
        for row in cursor.fetchall():
            agent_key = row['agent'].lower()
            parsed_output = row['output'] if isinstance(row['output'], dict) else json.loads(row['output']) if row['output'] else {}
            agent_statuses[agent_key] = {
                'name': row['agent'],
                'role': AGENT_ROLE_BY_NAME.get(row['agent'], row['agent']),
                'status': row['status'],
                'output': parsed_output
            }

        cursor.close()

        # Get memory from Redis if available
        memory = {}
        if redis_client:
            try:
                memory_data = redis_client.hgetall(f"task:{task_id}:memory")
                for key, value in memory_data.items():
                    memory[key] = json.loads(value)
            except:
                pass

        output_data = task['output']
        if isinstance(output_data, str):
            output_data = json.loads(output_data)

        return TaskStatusResponse(
            task_id=task_id,
            status=task['status'],
            logs=logs,
            agentStatus=agent_statuses,
            output=output_data or {},
            memory=memory
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/tasks")
async def get_all_tasks():
    """Get all tasks"""
    conn = None
    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            "SELECT id, input, status, output, created_at, updated_at FROM tasks ORDER BY created_at DESC LIMIT 100"
        )
        tasks = cursor.fetchall()
        cursor.close()

        return {
            'tasks': [
                {
                    'id': task['id'],
                    'input': task['input'],
                    'status': task['status'],
                    'created_at': task['created_at'].isoformat() if task['created_at'] else None,
                    'updated_at': task['updated_at'].isoformat() if task['updated_at'] else None,
                    'output': task['output'] if isinstance(task['output'], dict) else json.loads(task['output']) if task['output'] else {}
                }
                for task in tasks
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/memory/{task_id}")
async def get_memory(task_id: str):
    """Get task memory"""
    conn = None
    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Get memory from database
        cursor.execute(
            "SELECT * FROM memory_store WHERE task_id = %s",
            (task_id,)
        )
        memory_rows = cursor.fetchall()
        cursor.close()

        memory = {
            'shortTerm': f"Current task context",
            'longTerm': f"Previous task learnings",
            'semantic': [
                {'title': 'Knowledge 1', 'snippet': 'Details about knowledge 1'},
                {'title': 'Knowledge 2', 'snippet': 'Details about knowledge 2'},
            ]
        }

        return {'taskId': task_id, 'memory': memory}
    except Exception as e:
        logger.error(f"Error fetching memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    components = ['api']

    try:
        conn = DatabaseConnection.get_connection()
        conn.close()
        components.append('database')
    except:
        pass

    if redis_client:
        try:
            redis_client.ping()
            components.append('redis')
        except:
            pass

    try:
        channel = await get_rabbitmq_connection()
        components.append('rabbitmq')
    except:
        pass

    return {
        'status': 'healthy' if len(components) >= 3 else 'degraded',
        'components': components
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
