"""
Tester Agent Worker
Consumes from tester_queue, performs testing and QA
"""

import asyncio
import logging
from base_agent import BaseAgent, LLMClient
from typing import Dict

logger = logging.getLogger(__name__)

class TesterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_name='Tester',
            queue_name='tester_queue',
            next_queue='reporter_queue'
        )

    async def generate_output(self, task_id: str, task_input: str, previous_outputs: Dict) -> dict:
        """Generate testing output"""
        planner_output = previous_outputs.get('planner', {})
        researcher_output = previous_outputs.get('researcher', {})
        developer_output = previous_outputs.get('developer', {})

        plan_text = planner_output.get('plan', 'No plan available')
        research_text = researcher_output.get('research', 'No research available')
        implementation_text = developer_output.get('implementation', 'No implementation available')

        prompt = f"""You are a QA and testing specialist in a multi-agent AI system. Review the implementation and create comprehensive testing strategies.

Task: {task_input}

Planner's Plan:
{plan_text[:500]}...

Research Findings:
{research_text[:500]}...

Developer's Implementation:
{implementation_text[:1000]}...

Your testing analysis should include:
1. Unit test coverage and test cases
2. Integration testing scenarios
3. End-to-end test flows
4. Performance and load testing requirements
5. Security testing checklist
6. Accessibility and usability testing
7. Browser/device compatibility testing
8. Edge cases and error handling validation
9. Test automation recommendations
10. Quality metrics and acceptance criteria

Provide detailed testing strategies, test cases, and quality assurance recommendations."""

        try:
            response = LLMClient.request(prompt, max_tokens=1200, temperature=0.3)
            return {
                'name': 'Tester',
                'role': 'QA & Testing',
                'test_report': response,
                'timestamp': str(asyncio.get_event_loop().time())
            }
        except Exception as e:
            logger.error(f"Tester LLM request failed: {e}")
            return {
                'name': 'Tester',
                'role': 'QA & Testing',
                'test_report': f"Error generating test report: {str(e)}",
                'timestamp': str(asyncio.get_event_loop().time())
            }

async def main():
    """Main entry point for Tester agent"""
    agent = TesterAgent()
    try:
        await agent.start_consuming()
    except KeyboardInterrupt:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())