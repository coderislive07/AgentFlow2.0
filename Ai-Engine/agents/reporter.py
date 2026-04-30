import cohere
import os
from dotenv import load_dotenv


load_dotenv()

class ReporterAgent:
    def __init__(self):
        self.co = cohere.Client(os.getenv("COHERE_API_KEY"))

    def generate_report(self, plan, research, code, test):
        logger.info("Reporter Agent generating final report")

        prompt = f"""
        You are a project manager.

        Based on the following:

        Plan:
        {plan}

        Research:
        {research}

        Code:
        {code}

        Testing Feedback:
        {test}

        Generate a final structured report including:
        - Summary
        - Key steps
        - Code overview
        - Issues found
        - Final verdict
        """

        response = self.co.chat(
            model="command-xlarge-nightly",
            message=prompt,
            max_tokens=3000,
            temperature=0.2,
        )

        return response.text.strip()