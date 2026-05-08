"""
Planner Agent Worker
Consumes from planner_queue, creates execution plans
"""

import asyncio
import logging
from base_agent import BaseAgent, LLMClient
from typing import Dict

logger = logging.getLogger(__name__)

class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_name='Planner',
            queue_name='planner_queue',
            next_queue='researcher_queue'
        )

    async def generate_output(self, task_id: str, task_input: str, previous_outputs: Dict) -> dict:
        """Generate planning output"""
        prompt = f"""You are an expert project planner in a multi-agent AI system. Create a comprehensive execution plan for the following task.

Task: {task_input}

Your plan should include:
1. Project scope and objectives
2. Key milestones and deliverables
3. Timeline estimates
4. Team roles and responsibilities
5. Technology stack recommendations
6. Risk assessment and mitigation strategies
7. Success criteria

Provide a detailed, actionable plan that the development team can follow."""

        try:
            response = LLMClient.request(prompt, max_tokens=800, temperature=0.3)
            return {
                'name': 'Planner',
                'role': 'Strategic Planner',
                'plan': response,
                'timestamp': str(asyncio.get_event_loop().time())
            }
        except Exception as e:
            logger.error(f"Planner LLM request failed: {e}")
            return {
                'name': 'Planner',
                'role': 'Strategic Planner',
                'plan': f"Error generating plan: {str(e)}",
                'timestamp': str(asyncio.get_event_loop().time())
            }

async def main():
    """Main entry point for Planner agent"""
    agent = PlannerAgent()
    try:
        await agent.start_consuming()
    except KeyboardInterrupt:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())