import os

class FileWriter:
    def __init__(self, base_path="generated_projects"):
        self.base_path = base_path
        os.makedirs(self.base_path, exist_ok=True)

    # __call__ because we want to use this class as a function, so we can directly call the instance of the class with the necessary arguments to write a file without needing to define a separate method for it. This makes the code cleaner and more intuitive when we want to use the file writing functionality. For example, instead of doing file_writer.write_file(task_id, filename, content), we can simply do file_writer(task_id, filename, content) which is more concise and easier to read.
    def __call__(self, task_id, filename, content):
        project_path = os.path.join(self.base_path, task_id)
        os.makedirs(project_path, exist_ok=True)

        file_path = os.path.join(project_path, filename)

        with open(file_path, "w") as f:
            f.write(content)

        print(f"[FileWriter] Created: {file_path}")

        return file_path