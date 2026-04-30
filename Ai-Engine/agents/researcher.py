class ResearchAgent:
    def research(self, plan, logger):
        logger.info("Research Agent started")

        return [
            f"{step} with proper tools, libraries, and best practices"
            for step in plan
        ]