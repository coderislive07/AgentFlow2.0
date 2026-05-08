"""
Base Agent Worker - Consumer for RabbitMQ queues
Handles common agent functionality and LLM integration
"""

import os
import json
import logging
import asyncio
import aio_pika
import requests
from datetime import datetime
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import redis
from typing import List
from typing import List, Dict, Any, Optional
import cohere
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
AI_TIMEOUT = int(os.getenv('AI_TIMEOUT', '20'))

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

# ========== LLM Integration ==========
class LLMClient:
    @staticmethod
    def request(prompt: str, max_tokens: int = 650, temperature: float = 0.2) -> str:
        """Call an available LLM provider and return raw text."""
        # if OPENAI_API_KEY:
        #     try:
        #         response = requests.post(
        #             'https://api.openai.com/v1/chat/completions',
        #             headers={
        #                 'Authorization': f'Bearer {OPENAI_API_KEY}',
        #                 'Content-Type': 'application/json'
        #             },
        #             json={
        #                 'model': OPENAI_MODEL,
        #                 'messages': [
        #                     {'role': 'system', 'content': 'You are a collaborative multi-agent system that creates practical software solutions.'},
        #                     {'role': 'user', 'content': prompt}
        #                 ],
        #                 'max_tokens': max_tokens,
        #                 'temperature': temperature,
        #                 'top_p': 0.95,
        #                 'frequency_penalty': 0,
        #                 'presence_penalty': 0
        #             },
        #             timeout=AI_TIMEOUT
        #         )
        #         response.raise_for_status()
        #         return response.json()['choices'][0]['message']['content'].strip()
            # except Exception as err:
            #     logger.warning(f'OpenAI request failed: {err}')

        if COHERE_API_KEY:
            try:
                co = cohere.Client(COHERE_API_KEY)
                response = co.chat(
                model="command-xlarge-nightly",
                message=prompt,
                temperature=temperature,
                )                   
                return response.text.strip()
            except Exception as err:
                logger.warning(f'Cohere request failed: {err}')

                return f"""
                Fallback response generated because Cohere API timed out.

                Agent: {prompt[:100]}
                """


# ========== Base Agent Class ==========
class BaseAgent:
    """Base class for all agent workers"""

    def __init__(self, agent_name: str, queue_name: str, next_queue: Optional[str] = None):
        self.agent_name = agent_name
        self.queue_name = queue_name
        self.next_queue = next_queue
        self.connection = None
        self.channel = None

    async def connect_rabbitmq(self):
        """Connect to RabbitMQ"""
        self.connection = await aio_pika.connect_robust(
            f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASSWORD}@{RABBITMQ_HOST}/"
        )
        self.channel = await self.connection.channel()
        await self.channel.set_qos(prefetch_count=1)
        logger.info(f"{self.agent_name} connected to RabbitMQ")

    def log_activity(self, task_id: str, message: str, status: str = 'running', output: Dict = None):
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
                (task_id, self.agent_name, message, status, json.dumps(output) if output else None)
            )
            conn.commit()
            cursor.close()

            # Broadcast log update
            self.broadcast_update(task_id, 'log-update', {
                'agent': self.agent_name,
                'message': message,
                'status': status,
                'output': output
            })

        except Exception as e:
            logger.error(f"Failed to log agent activity: {e}")
        finally:
            if conn:
                conn.close()

    def update_status(self, task_id: str, status: str, output: Dict = None):
        """Update agent status in database and broadcast to clients"""
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
                (task_id, self.agent_name, status, json.dumps(output) if output else None)
            )
            conn.commit()
            cursor.close()

            self.broadcast_update(task_id, 'agent-status-update', {
                'agent': self.agent_name.lower(),
                'status': status,
                'output': output
            })

        except Exception as e:
            logger.error(f"Failed to update agent status: {e}")
        finally:
            if conn:
                conn.close()

    def broadcast_update(self, task_id: str, event_type: str, data: Dict):
        """Broadcast real-time update to connected clients"""
        try:
            update_data = {
                'task_id': task_id,
                'event_type': event_type,
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            # Send to API gateway for Socket.IO broadcasting
            response = requests.post(
                'http://api-gateway:5000/api/broadcast',
                json=update_data,
                timeout=5
            )
            if response.status_code != 200:
                logger.warning(f"Failed to broadcast update: {response.status_code}")
            else:
                logger.info(f"[Broadcast] {event_type} for task {task_id}")
        except Exception as e:
            logger.warning(f"Error broadcasting update: {e}")

    def send_team_message(self, task_id: str, message: str, target_agent: Optional[str] = None):
        """Send a message to other team members"""
        try:
            team_data = {
                'from_agent': self.agent_name,
                'to_agent': target_agent,
                'message': message,
                'timestamp': datetime.now().isoformat()
            }

            # Store in Redis for team communication
            if redis_client:
                redis_client.lpush(f"task:{task_id}:team_messages", json.dumps(team_data))
                redis_client.expire(f"task:{task_id}:team_messages", 3600)  # Expire after 1 hour

            # Broadcast team message
            self.broadcast_update(task_id, 'team-message', team_data)

            logger.info(f"{self.agent_name} sent team message: {message}")

        except Exception as e:
            logger.warning(f"Failed to send team message: {e}")

    def get_team_messages(self, task_id: str, limit: int = 10) -> List[Dict]:
        """Get recent team messages"""
        try:
            if redis_client:
                messages = redis_client.lrange(f"task:{task_id}:team_messages", 0, limit - 1)
                return [json.loads(msg) for msg in messages]
            return []
        except Exception as e:
            logger.warning(f"Failed to get team messages: {e}")
            return []

    def request_collaboration(self, task_id: str, request_type: str, details: Dict):
        """Request collaboration from other agents"""
        try:
            collab_data = {
                'from_agent': self.agent_name,
                'request_type': request_type,
                'details': details,
                'timestamp': datetime.now().isoformat()
            }

            # Store collaboration request
            if redis_client:
                redis_client.lpush(f"task:{task_id}:collaboration", json.dumps(collab_data))
                redis_client.expire(f"task:{task_id}:collaboration", 3600)

            # Broadcast collaboration request
            self.broadcast_update(task_id, 'collaboration-request', collab_data)

            logger.info(f"{self.agent_name} requested collaboration: {request_type}")

        except Exception as e:
            logger.warning(f"Failed to request collaboration: {e}")

    def get_collaboration_requests(self, task_id: str) -> List[Dict]:
        """Get pending collaboration requests"""
        try:
            if redis_client:
                requests = redis_client.lrange(f"task:{task_id}:collaboration", 0, -1)
                return [json.loads(req) for req in requests]
            return []
        except Exception as e:
            logger.warning(f"Failed to get collaboration requests: {e}")
            return []

    def get_previous_outputs(self, task_id: str) -> Dict[str, Any]:
        """Get outputs from previous agents"""
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute(
                "SELECT agent, output FROM agent_status WHERE task_id = %s AND status = 'completed'",
                (task_id,)
            )
            results = cursor.fetchall()
            cursor.close()

            outputs = {}
            for row in results:
                agent_key = row['agent'].lower()
                output_value = row['output']
                if not output_value:
                    outputs[agent_key] = {}
                elif isinstance(output_value, dict):
                    outputs[agent_key] = output_value
                else:
                    try:
                        # Try to parse as JSON
                        outputs[agent_key] = json.loads(output_value)
                    except (json.JSONDecodeError, TypeError):
                        # If not JSON, treat as string or try to eval if it's a safe dict-like string
                        if isinstance(output_value, str) and output_value.startswith('{'):
                            try:
                                # Try to eval if it looks like a dict string
                                outputs[agent_key] = eval(output_value)
                            except:
                                outputs[agent_key] = {'raw_output': output_value}
                        else:
                            outputs[agent_key] = {'raw_output': output_value}
            return outputs
        except Exception as e:
            logger.error(f"Failed to get previous outputs: {e}")
            return {}
        finally:
            if conn:
                conn.close()

    async def publish_next(self, task_id: str, task_input: str, agent_output: Dict):
        """Publish to next queue in workflow"""
        if not self.next_queue:
            # This is the final agent, mark task as completed
            await self.complete_task(task_id, agent_output)
            return

        try:
            await self.channel.declare_queue(self.next_queue, durable=True)
            message = {
                'task_id': task_id,
                'input': task_input,
                'agent': self.agent_name,
                'previous_output': agent_output
            }
            await self.channel.default_exchange.publish(
                aio_pika.Message(body=json.dumps(message).encode()),
                routing_key=self.next_queue
            )
            logger.info(f"{self.agent_name} published to {self.next_queue} for task {task_id}")
        except Exception as e:
            logger.error(f"Failed to publish to next queue: {e}")

    async def complete_task(self, task_id: str, final_output: Dict):
        """Mark task as completed"""
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            # Get all agent outputs
            cursor.execute(
                "SELECT agent, output FROM agent_status WHERE task_id = %s",
                (task_id,)
            )
            all_outputs = {}
            for row in cursor.fetchall():
                output_value = row['output']
                if not output_value:
                    all_outputs[row['agent'].lower()] = {}
                elif isinstance(output_value, dict):
                    all_outputs[row['agent'].lower()] = output_value
                else:
                    try:
                        all_outputs[row['agent'].lower()] = json.loads(output_value)
                    except (json.JSONDecodeError, TypeError):
                        all_outputs[row['agent'].lower()] = {'raw_output': str(output_value)}

            # Update task with final output
            cursor.execute(
                """
                UPDATE tasks
                SET status = %s, output = %s, updated_at = NOW()
                WHERE id = %s
                """,
                ('completed', json.dumps(all_outputs), task_id)
            )
            conn.commit()
            cursor.close()

            logger.info(f"Task {task_id} completed by {self.agent_name}")

            # Broadcast task completion
            self.broadcast_update(task_id, 'task-completed', {
                'status': 'completed',
                'output': all_outputs
            })

        except Exception as e:
            logger.error(f"Failed to complete task: {e}")
        finally:
            if conn:
                conn.close()

    async def process_message(self, message: aio_pika.IncomingMessage):
        """Process a message from the queue"""
        async with message.process():
            try:
                data = json.loads(message.body.decode())
                task_id = data['task_id']
                task_input = data['input']

                logger.info(f"{self.agent_name} processing task {task_id}")
                

                # Update status to running
                self.update_status(task_id, 'running')
                self.log_activity(task_id, f"Starting {self.agent_name} execution", 'running')

                # Get previous outputs
                previous_outputs = self.get_previous_outputs(task_id)

                # Generate agent output
                agent_output = await self.generate_output(task_id, task_input, previous_outputs)

                # Update status to completed
                self.update_status(task_id, 'completed', agent_output)
                self.log_activity(task_id, f"{self.agent_name} completed successfully", 'completed', agent_output)

                # Publish to next queue or complete task
                await self.publish_next(task_id, task_input, agent_output)

            except Exception as e:
                logger.error(f"{self.agent_name} failed to process message: {e}")
                # Update status to failed
                try:
                    data = json.loads(message.body.decode())
                    task_id = data['task_id']
                    self.update_status(task_id, 'failed')
                    self.log_activity(task_id, f"Error: {str(e)}", 'failed')
                except:
                    pass

    async def generate_output(self, task_id: str, task_input: str, previous_outputs: Dict) -> dict:
        """Generate agent-specific output - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement generate_output")

    async def start_consuming(self):
        """Start consuming messages from queue"""
        await self.connect_rabbitmq()

        # Declare queue
        queue = await self.channel.declare_queue(self.queue_name, durable=True)

        # Start consuming
        await queue.consume(self.process_message)

        logger.info(f"{self.agent_name} started consuming from {self.queue_name}")
        await asyncio.Future()  # Run forever

    async def shutdown(self):
        """Shutdown the agent"""
        if self.connection:
            await self.connection.close()
        logger.info(f"{self.agent_name} shutdown")