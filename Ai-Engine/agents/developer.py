import cohere
import os
import json
from dotenv import load_dotenv

load_dotenv()

class DeveloperAgent:
    def __init__(self):
        self.co = cohere.Client(os.getenv("COHERE_API_KEY"))

    def generate_code(self, task_id, research_steps, tool_manager , logger):
        logger.info("Developer Agent generating code based on research steps.")

        prompt = f"""
You are a senior full-stack developer.

Based on the following steps:
{research_steps}

Generate a complete project in STRICT JSON format.

Rules:
- Output ONLY valid JSON
- Do NOT include explanations
- Do NOT include markdown (no ```)

Format:
{{
  "files": [
    {{
      "filename": "index.html",
      "content": "<html>...</html>"
    }},
    {{
      "filename": "style.css",
      "content": "body {{ ... }}"
    }},
    {{
      "filename": "script.js",
      "content": "console.log('Hello');"
    }}
  ]
}}
"""

        
        response = self.co.chat(
            model="command-xlarge-nightly",
            message=prompt,
            max_tokens=3000,
            temperature=0.2,
        )

        raw_output = response.text.strip()

        
        print("RAW LLM OUTPUT:", raw_output[:300])

        # parsing to json because we need to extract the files and their content from the LLM output to create the actual files using the file writer tool. The LLM is supposed to return a JSON string that contains a list of files with their filenames and content, so we need to parse that string into a Python dictionary to work with it programmatically. If the LLM output is not valid JSON, we catch the error and return an empty list of files along with the raw output for debugging purposes.
        try:
            project = json.loads(raw_output)
        except json.JSONDecodeError as e:
            print("json decode error:", e)
            return {
                "files": [],
                "raw": raw_output
            }

        # here we are using the tool manager to execute the file writer tool for each file in the project and store the file paths in a list. The tool manager will handle the execution of the file writer and return the path of the created file, which we can then store in our memory or return as part of the output. This way, we can keep track of all the files that were created as part of this task and easily access them later when we need to run tests or generate reports based on the code.
        file_paths = []

        for file in project.get("files", []):
            path = tool_manager.execute(
                "file_writer",
                task_id=task_id,
                filename=file["filename"],
                content=file["content"]
            )
            file_paths.append(path)

        return {
            "files": file_paths,
            "raw": raw_output
        }