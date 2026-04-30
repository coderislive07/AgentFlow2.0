import time  # 1. Added for rate limiting
import cohere
import os
from dotenv import load_dotenv

from agents.planner import PlannerAgent
from agents.researcher import ResearchAgent
from agents.developer import DeveloperAgent
from agents.reporter import ReporterAgent
from agents.tester import TesterAgent
from memory.memory_store import MemoryStore
from tools.tool_manager import ToolManager
from tools.file_writer import FileWriter
from tools.zipper import Zipper
from utils.logger import Logger

class Orchestrator:
    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearchAgent()
        self.developer = DeveloperAgent()
        self.reporter = ReporterAgent()
        self.tester = TesterAgent()

        self.tool_manager = ToolManager()
        self.tool_manager.register_tool("file_writer", FileWriter())
        self.tool_manager.register_tool("zipper", Zipper())

        load_dotenv()
        self.co = cohere.Client(os.getenv("COHERE_API_KEY"))

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

        response = self.co.chat(
            model="command-xlarge-nightly",
            message=prompt,
            max_tokens=10,  # 4. Low tokens = faster & cheaper
            temperature=0,   # 5. Deterministic (no "creative" loops)
        )

        return response.text.strip().lower()

    def process_task(self, task):
        logger = Logger(task["id"])
        logger.info(f"Task started: {task}")
        memory = MemoryStore(task["id"])

        while True:
            # 6. Safety Brake: Prevents 429 Error (Trial limit is 20 calls/min)
            time.sleep(3) 

            next_agent = self.decide_next_agent(memory)
            logger.debug(f"Next agent: {next_agent}")

            if "planner" in next_agent:
                plan = self.planner.create_plan(task, logger)
                memory.save("plan", plan)

            elif "researcher" in next_agent:
                plan = memory.load("plan")
                research = self.researcher.research(plan, logger)
                memory.save("research", research)

            elif "developer" in next_agent:
                research = memory.load("research")
                dev_output = self.developer.generate_code(
                    task["id"],
                    research,
                    self.tool_manager,
                    logger
                )
                memory.save("code", dev_output["raw"])
                memory.save("files", dev_output["files"])

            elif "tester" in next_agent:
                code = memory.load("code")
                # 7. Fixed: Removed 'logger' because TesterAgent.test_code only takes 'code'
                test = self.tester.test_code(code)
                memory.save("test", test)

            elif "reporter" in next_agent:
                plan = memory.load("plan")
                research = memory.load("research")
                code = memory.load("code")
                test = memory.load("test")

                # 8. Fixed: Removed 'logger' because ReporterAgent.generate_report doesn't accept it
                report = self.reporter.generate_report(plan, research, code, test)

                zip_path = self.tool_manager.execute(
                    "zipper",
                    logger=logger,
                    task_id=task["id"]
                )

                memory.save("report", report)
                memory.save("zip", zip_path)

            elif "done" in next_agent:
                logger.info("Task completed")
                break

        return {
            "plan": memory.load("plan"),
            "research": memory.load("research"),
            "code": memory.load("code"),
            "test": memory.load("test"),
            "report": memory.load("report"),
            "zip": memory.load("zip")
        }