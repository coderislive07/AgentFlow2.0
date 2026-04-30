import redis
import json

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

class MemoryStore:
    def __init__(self, task_id):
        self.task_id = task_id

    def save(self, key, value):
        r.set(f"{self.task_id}:{key}", json.dumps(value))

    def load(self, key):
        data = r.get(f"{self.task_id}:{key}")
        return json.loads(data) if data else None