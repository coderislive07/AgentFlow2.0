import cohere
import os
from dotenv import load_dotenv

load_dotenv()

class TesterAgent:
    def __init__(self):
        self.co = cohere.Client(os.getenv("COHERE_API_KEY"))

    def test_code(self, code , logger):
        logger.info("Tester Agent received code")

        prompt = f"""
        You are a senior QA engineer.

        Analyze the following code:
        {code}

        Provide:
        - Bugs
        - Improvements
        - Best practices
        """

        response = self.co.chat(
            model="command-xlarge-nightly",
            message=prompt,
            max_tokens=3000,
            temperature=0.2,
        )

        return response.text.strip()