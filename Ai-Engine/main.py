import redis
import json 
import time 
from orchestrator.orchestrator import Orchestrator

orchestrator = Orchestrator()

# i am using redis to create a simple task queue. The idea is that I will push tasks into the 'task_queue' list in redis, and this script will continuously check for new tasks and process them.
# here redis is working as message broker between node and python. The node script will push tasks into the 'task_queue' list, and this python script will pop tasks from the list and process them.

# first let's connect to redis 
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

print("Connected to Redis")

while True:
    # check for new messages in the 'messages' list
    task = r.blpop('task_queue', timeout=0)  # this returns a tuple 
    if task:
        # this line is to unpack the tuple returned by blpop. The first element of the tuple is the name of the list (in this case 'task_queue'), and the second element is the actual task data that was pushed into the list. We only care about the task data, so we can ignore the first element by using an underscore (_).
        _, task_data = task 
        # loads convert the string back to a python dictionary
        task_json = json.loads(task_data)
        print(f"Received task: {task_json}")
        # here you can add your code to process the task. For example, if the task
        result_data = orchestrator.process_task(task_json)
        result = {
        "task_id": task_json["id"],
        "plan": result_data["plan"],
        "research": result_data["research"],
        "code": result_data["code"],
        "report": result_data["report"]
        }
        # store the result now 
        # json dump the result back to a string and store it in redis with a key that includes the task id so we can retrieve it later
        r.set(f"result:{task_json['id']}", json.dumps(result))
        
