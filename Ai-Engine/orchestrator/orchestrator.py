import asyncio
import time  # 1. Added for rate limiting
import cohere
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import aio_pika
from dotenv import load_dotenv
from typing import Callable, Dict, Any, Optional

# Import the new RabbitMQ worker agents
from planner_agent import PlannerAgent
from researcher_agent import ResearcherAgent
from developer_agent import DeveloperAgent
from tester_agent import TesterAgent
from reporter_agent import ReporterAgent

from memory.memory_store import MemoryStore
from tools.tool_manager import ToolManager
from tools.file_writer import FileWriter
from tools.zipper import Zipper
from utils.logger import Logger

class Orchestrator:
    def __init__(self, on_agent_status_change: Optional[Callable] = None):
        # Remove old agent instantiations
        self.tool_manager = ToolManager()
        self.tool_manager.register_tool("file_writer", FileWriter())
        self.tool_manager.register_tool("zipper", Zipper())

        load_dotenv()
        self.co = cohere.Client(os.getenv("COHERE_API_KEY"))
        
        # RabbitMQ connection for publishing to queues
        self.rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
        self.rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
        self.rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guest')
        self.connection = None
        self.channel = None
        
        # Database connection for agent status
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'dbname': os.getenv('DB_NAME', 'agentflow'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres')
        }
        
        # Callback for status updates
        self.on_agent_status_change = on_agent_status_change

    async def connect_rabbitmq(self):
        """Connect to RabbitMQ for publishing messages"""
        if not self.connection:
            self.connection = await aio_pika.connect_robust(
                f"amqp://{self.rabbitmq_user}:{self.rabbitmq_password}@{self.rabbitmq_host}/"
            )
            self.channel = await self.connection.channel()
            await self.channel.set_qos(prefetch_count=1)
            print("Orchestrator connected to RabbitMQ")

    async def publish_to_queue(self, queue_name: str, message: Dict):
        """Publish message to a queue"""
        await self.connect_rabbitmq()
        await self.channel.declare_queue(queue_name, durable=True)
        
        await self.channel.default_exchange.publish(
            aio_pika.Message(body=json.dumps(message).encode()),
            routing_key=queue_name
        )
        print(f"Orchestrator published to {queue_name}: {message}")

    def _notify_agent_status(self, agent: str, status: str, output: Any = None, message: str = ""):
        """Notify about agent status change"""
        # Note: Agents handle their own database updates through BaseAgent
        # This is just for logging/debugging
        print(f"[Orchestrator] Agent {agent} status: {status} - {message}")
        """Notify about agent status change and save to database"""
        # Save to database
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            # Insert or update agent status
            cursor.execute("""
                INSERT INTO agent_status (task_id, agent, status, output, updated_at)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (task_id, agent) 
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    output = EXCLUDED.output,
                    updated_at = NOW()
            """, (self.current_task_id, agent, status, json.dumps(output) if output else None))
            
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Error saving agent status to DB: {e}")
        
        # Call callback if provided
        if self.on_agent_status_change:
            try:
                self.on_agent_status_change({
                    "agent": agent,
                    "status": status,
                    "output": output,
                    "message": message
                })
            except Exception as e:
                print(f"Error calling status callback: {e}")

    def decide_next_agent(self, memory):
        # 2. Use Booleans. LLMs handle "True/False" better than long text blocks for logic.
        state = {
            "has_plan": bool(memory.load("plan")),
            "has_research": bool(memory.load("research")),
            "has_code": bool(memory.load("code")),
            "has_test": bool(memory.load("test")),
            "has_report": bool(memory.load("report"))
        }

        # 3. Explicit logic rules prevent the LLM from getting stuck on "planner"
        prompt = f"""
System State: {state}

Rules:
- If has_plan is False -> planner
- If has_plan is True and has_research is False -> researcher
- If has_research is True and has_code is False -> developer
- If has_code is True and has_test is False -> tester
- If has_test is True and has_report is False -> reporter
- If all are True -> done

Next agent (one word only):"""

        try:
            response = self.co.chat(
                model="command-xlarge-nightly",
                message=prompt,
                max_tokens=10,  # 4. Low tokens = faster & cheaper
                temperature=0,   # 5. Deterministic (no "creative" loops)
            )

            result = response.text.strip().lower()
            return result
        except Exception as e:
            print(f"Error calling Cohere API: {e}")
            # Fallback logic
            if not state["has_plan"]:
                return "planner"
            elif not state["has_research"]:
                return "researcher"
            elif not state["has_code"]:
                return "developer"
            elif not state["has_test"]:
                return "tester"
            elif not state["has_report"]:
                return "reporter"
            else:
                return "done"

    async def process_task(self, task):
        """Process task using RabbitMQ distributed architecture"""
        logger = Logger(task["id"])
        logger.info(f"Task started: {task}")

        # Set current task ID for status updates
        self.current_task_id = task["id"]

        try:
            # ---------------- ORCHESTRATOR START ----------------
            self._notify_agent_status(
                "planner",
                "running",
                None,
                "Planner started processing task"
            )

            logger.info("Planner workflow initialized")

            # ---------------- PUBLISH TO PLANNER ----------------
            await self.publish_to_queue(
                'planner_queue',
                {
                    'task_id': task['id'],
                    'input': task['input'],
                    'agent': 'orchestrator',
                    'previous_output': {}
                }
            )

            # ---------------- UPDATE STATUS ----------------
            self._notify_agent_status(
                "planner",
                "queued",
                None,
                "Task queued for planner"
            )

            logger.info("Task successfully queued to planner")

            # Workflow continues automatically:
            # planner -> researcher -> developer -> tester -> reporter

            return {
                "status": "workflow_started",
                "message": "Task workflow initiated through RabbitMQ queues"
            }

        except Exception as e:
            logger.error(f"Error starting workflow: {e}")

            self._notify_agent_status(
                "planner",
                "failed",
                None,
                f"Workflow failed: {str(e)}"
            )

            raise