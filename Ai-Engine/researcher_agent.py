"""
Researcher Agent Worker
Consumes from researcher_queue, performs research
"""

import asyncio
import logging
from base_agent import BaseAgent, LLMClient

from typing import Dict

logger = logging.getLogger(__name__)

class ResearcherAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_name='Researcher',
            queue_name='researcher_queue',
            next_queue='developer_queue'
        )

    async def generate_output(self, task_id: str, task_input: str, previous_outputs: Dict) -> dict:
        """Generate research output"""
        planner_output = previous_outputs.get('planner', {})
        plan_text = planner_output.get('plan', 'No plan available')

        prompt = f"""You are a research specialist in a multi-agent AI system. Based on the task and the planner's execution plan, conduct comprehensive research.

Task: {task_input}

Planner's Plan:
{plan_text}

Your research should include:
1. Industry best practices and standards
2. Technology recommendations and comparisons
3. Architecture patterns and design considerations
4. Security and compliance requirements
5. Performance and scalability considerations
6. Integration possibilities and APIs
7. Potential challenges and solutions
8. Resource requirements and cost estimates

Provide detailed research findings that will inform the development phase."""

        try:
            response = LLMClient.request(prompt, max_tokens=1000, temperature=0.4)
            return {
                'name': 'Researcher',
                'role': 'Research Specialist',
                'research': response,
                'timestamp': str(asyncio.get_event_loop().time())
            }
        except Exception as e:
            logger.error(f"Researcher LLM request failed: {e}")
            return {
                'name': 'Researcher',
                'role': 'Research Specialist',
                'research': f"Error conducting research: {str(e)}",
                'timestamp': str(asyncio.get_event_loop().time())
            }

async def main():
    """Main entry point for Researcher agent"""
    agent = ResearcherAgent()
    try:
        await agent.start_consuming()
    except KeyboardInterrupt:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())