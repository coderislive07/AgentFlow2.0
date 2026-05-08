import os
import json
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

_r = None
_fallback_store = {}

try:
    _r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, db=0)
    _r.ping()
except Exception:
    _r = None

class MemoryStore:
    def __init__(self, task_id):
        self.task_id = task_id

    def save(self, key, value):
        storage_key = f"{self.task_id}:{key}"
        payload = json.dumps(value)
        if _r:
            try:
                _r.set(storage_key, payload)
                return
            except Exception:
                pass
        _fallback_store[storage_key] = payload

    def load(self, key):
        storage_key = f"{self.task_id}:{key}"
        if _r:
            try:
                data = _r.get(storage_key)
            except Exception:
                data = None
        else:
            data = _fallback_store.get(storage_key)
        return json.loads(data) if data else None