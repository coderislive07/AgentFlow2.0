import datetime

class Logger:
    def __init__(self, task_id):
        self.task_id = task_id

    def log(self, level, message):
        time = datetime.datetime.now().strftime("%H:%M:%S")

        print(f"[{level}] | Task: {self.task_id} | {time} | {message}")

    def info(self, message):
        self.log("INFO", message)

    def error(self, message):
        self.log("ERROR", message)

    def debug(self, message):
        self.log("DEBUG", message)