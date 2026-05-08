"""
Reporter Agent Worker
Consumes from reporter_queue, generates final reports
"""

import asyncio
import logging
from base_agent import BaseAgent, LLMClient
from typing import Dict

logger = logging.getLogger(__name__)

#  ERROR:base_agent:Failed to complete task: tuple indices must be integers or slices, not str
# this above error is likely due to the way previous_outputs is being accessed in the generate_output method.
# how to remove this error ? ans 0






class ReporterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_name='Reporter',
            queue_name='reporter_queue',
            next_queue=None  # Final agent
        )
 

    async def generate_output(self, task_id: str, task_input: str, previous_outputs: Dict) -> dict:
        """Generate final report output"""
        planner_output = previous_outputs.get('planner', {})
        researcher_output = previous_outputs.get('researcher', {})
        developer_output = previous_outputs.get('developer', {})
        tester_output = previous_outputs.get('tester', {})

        plan_text = planner_output.get('plan', 'No plan available')
        research_text = researcher_output.get('research', 'No research available')
        implementation_text = developer_output.get('implementation', 'No implementation available')
        test_report = tester_output.get('test_report', 'No test report available')

        prompt = f"""You are a project reporter and delivery specialist in a multi-agent AI system. Create a comprehensive final report synthesizing all phases of the project.

Task: {task_input}

## Project Summary

### Planning Phase
{plan_text[:300]}...

### Research Phase
{research_text[:300]}...

### Development Phase
{implementation_text[:500]}...

### Testing Phase
{test_report[:300]}...

## Final Deliverables Report

Create a professional executive summary that includes:

1. **Project Overview**: Complete summary of what was accomplished
2. **Technical Architecture**: System design and technology choices
3. **Implementation Details**: Key features and functionality delivered
4. **Quality Assurance**: Testing results and quality metrics
5. **Deployment Guide**: How to deploy and run the solution
6. **Next Steps**: Recommendations for future development
7. **Risk Assessment**: Any remaining risks or concerns
8. **Success Metrics**: How to measure project success

Format this as a professional project delivery report."""

        try:
            response = LLMClient.request(prompt, max_tokens=1500, temperature=0.2)
            return {
                'name': 'Reporter',
                'role': 'Reporting & Delivery',
                'final_report': response,
                'deliverables': {
                    'project_id': developer_output.get('project_id', 'N/A'),
                    'status': 'completed',
                    'quality_score': '95%',  # Mock quality score
                    'completion_date': str(asyncio.get_event_loop().time())
                },
                'timestamp': str(asyncio.get_event_loop().time())
            }
        except Exception as e:
            logger.error(f"Reporter LLM request failed: {e}")
            return {
                'name': 'Reporter',
                'role': 'Reporting & Delivery',
                'final_report': f"Error generating final report: {str(e)}",
                'deliverables': {
                    'status': 'error',
                    'error': str(e)
                },
                'timestamp': str(asyncio.get_event_loop().time())
            }

async def main():
    """Main entry point for Reporter agent"""
    agent = ReporterAgent()
    try:
        await agent.start_consuming()
    except KeyboardInterrupt:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())