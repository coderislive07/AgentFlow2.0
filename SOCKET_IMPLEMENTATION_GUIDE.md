# AgentFlow Real-Time Socket.IO Implementation - Complete Fix

## Summary of Changes

All identified issues have been systematically fixed to enable real-time updates from backend orchestration to the frontend UI via WebSocket (Socket.IO).

---

## 1. Frontend Socket Integration (useSocket Hook)

**File:** `client/src/hooks/useSocket.js` (CREATED)

The missing socket hook has been created with full event handling:

```javascript
- Connects to Socket.IO server
- Joins task-specific rooms (task-{taskId})
- Listens to 9 different real-time events
- Updates Zustand store with agent status changes
- Auto-reconnects on disconnect
```

**Events Handled:**
- `task-created`: Initial task creation
- `task-update`: Task status changes
- `agent-start`: Agent begins execution
- `agent-log`: Agent sends progress/log messages
- `agent-complete`: Agent finishes execution
- `task-progress`: Batch updates with all agent statuses
- `workflow-complete`: Entire workflow finished
- `error` & `disconnect`: Connection issues

---

## 2. Real-Time Polling & Broadcasting

**File:** `server/routes/taskRoutes.js` (ENHANCED)

Added polling system that automatically broadcasts updates:

**Key Changes:**
- `startTaskPolling()`: Polls AI Engine every 1 second
- Detects agent state transitions (idle → running → completed)
- Emits appropriate socket events for each change
- Automatically stops polling when task completes
- Prevents duplicate events with state comparison

**Polling Logic:**
```
Monitor agentStatus → Detect Changes → Emit Socket Event → Frontend Updates
```

---

## 3. Backend Task Executor with Callbacks

**File:** `Ai-Engine/main.py` (ENHANCED)

Added task execution system with database integration:

**New Functions:**
- `execute_task_workflow()`: Runs tasks in background thread
- Integrates with database for status tracking
- Invokes orchestrator with status callbacks
- Updates `agent_status` table as agents progress
- Logs all agent activities to `agent_logs` table

**Execution Flow:**
1. Task created → Status: pending
2. Polling starts → Status: running
3. Orchestrator executes agents
4. Each agent status update → Callback → DB update
5. Polling detects changes → Socket event sent
6. Frontend receives event → UI updates

---

## 4. Orchestrator Status Callbacks

**File:** `Ai-Engine/orchestrator/orchestrator.py` (ENHANCED)

Updated orchestrator to track and report agent progress:

**New Features:**
- `on_agent_status_change` callback parameter
- `_notify_agent_status()` method for status updates
- Proper error handling with fallback logic
- Cohere API error handling
- Max iterations safeguard

**Agent Notifications:**
- Agent starts → status: "running"
- Agent completes → status: "completed"
- Includes output and descriptive messages

---

## Environment Setup

### Frontend (.env.local in client/)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Backend (Docker Compose or .env)
```env
COHERE_API_KEY=your_cohere_key
AI_ENGINE_URL=http://localhost:8000
DB_HOST=postgres
REDIS_HOST=redis
RABBITMQ_HOST=rabbitmq
```

---

## Complete Data Flow

```
USER ACTION: Submit Task
       ↓
FRONTEND: TaskInput.jsx → submitTask() → POST /api/task
       ↓
NODE BACKEND: POST /api/task handler
  - Create request to Python AI Engine
  - Emit 'task-created' socket event
  - Call startTaskPolling()
       ↓
PYTHON BACKEND: POST /api/task endpoint
  - Create task record in database (status: pending)
  - Return task_id
       ↓
NODE POLLING LOOP (every 1 second)
  - GET /api/task/{taskId} from Python backend
  - Compare current state with previous state
  - Detect changes in agentStatus and logs
  - Emit socket events for changes:
    * agent-start
    * agent-log
    * agent-complete
    * task-progress
    * workflow-complete
       ↓
PYTHON BACKGROUND THREAD: execute_task_workflow()
  - Initialize Orchestrator with callback
  - For each agent in workflow:
    * Update DB: agent_status.status = 'running'
    * Execute agent
    * Callback fired → DB update
    * Update DB: agent_status.status = 'completed'
  - Update task status: 'completed'
       ↓
POLLING DETECTS: agentStatus change
  - Emits appropriate socket event
       ↓
FRONTEND: useSocket hook receives event
  - Calls Zustand store actions:
    * addLog() → add to logs array
    * updateAgentStatus() → update agent state
    * setStatus() → update overall task status
    * setOutput() → update final output
       ↓
UI: opsRoom page.jsx
  - Re-renders with new agent statuses
  - Displays live logs
  - Shows progress bars
  - Updates agent badges (Waiting → Running → Completed)
       ↓
USER SEES: Real-time updates in Operations Room
```

---

## Key Fixes Implemented

| Issue | Solution | File |
|-------|----------|------|
| useSocket hook missing | Created new hook with full event handling | `client/src/hooks/useSocket.js` |
| No socket events emitted | Added polling + emit logic | `server/routes/taskRoutes.js` |
| Tasks not executed | Added background task executor | `Ai-Engine/main.py` |
| No agent status updates | Added callback mechanism | `Ai-Engine/orchestrator/orchestrator.py` |
| Frontend not joining rooms | useSocket emits join-task on mount | `client/src/hooks/useSocket.js` |
| Cohere calls failing silently | Added error handling & fallback | `Ai-Engine/orchestrator/orchestrator.py` |
| Agent logs not propagated | Polling detects & emits log events | `server/routes/taskRoutes.js` |
| UI state not updating | Socket events update Zustand store | `client/src/store/opsStore.js` |

---

## Testing Procedure

### 1. Start All Services
```bash
docker-compose up --build
```

### 2. Verify Services are Running
```bash
# Check ports
curl http://localhost:5000/health      # Node backend
curl http://localhost:8000/api/health   # Python AI Engine
curl http://localhost:3000              # Next.js frontend
```

### 3. Submit a Task
- Navigate to Operations Room
- Enter a task description
- Click "Submit Task"
- Watch browser console for socket events

### 4. Monitor Real-Time Updates
- Check browser DevTools Console:
  - Should see "[Socket] joined task room"
  - Should see "[Socket] task-created"
  - Should see agent start/log/complete events
- Check Operations Room UI:
  - Agent badges should change from Waiting → Running → Completed
  - Live logs should appear in real-time
  - Progress bar should increase

### 5. Verify Database
```bash
# Connect to PostgreSQL
psql -h localhost -p 5433 -U postgres -d agentflow

# Check task status
SELECT id, status, created_at, updated_at FROM tasks ORDER BY created_at DESC LIMIT 1;

# Check agent logs
SELECT agent, message, status, timestamp FROM agent_logs ORDER BY timestamp DESC LIMIT 20;

# Check agent status
SELECT agent, status, updated_at FROM agent_status WHERE task_id = '{task_id}' ORDER BY updated_at;
```

### 6. Monitor Server Logs
```bash
# Watch Node backend polling
docker logs -f container_id_node_server

# Watch Python AI Engine
docker logs -f container_id_python_ai
```

---

## Performance Considerations

- **Polling Interval**: 1 second (configured in `taskRoutes.js`)
  - Change `setInterval(..., 1000)` to adjust
  - Lower = more real-time but higher CPU
  - Higher = less CPU but slower updates

- **Memory**: Polling intervals are stored in Map
  - Automatically cleaned up when task completes
  - Thread-safe with database connections

- **Scalability**: 
  - Currently uses background threads (single process)
  - For production: Consider RabbitMQ consumer workers
  - Or: Implement WebSocket broadcast from Python backend

---

## Troubleshooting

### Socket Events Not Received
- Check browser console for connection logs
- Verify `NEXT_PUBLIC_SOCKET_URL` env var
- Check CORS settings in `server/server.js`
- Ensure task room joined with correct taskId

### Agent Status Not Updating
- Check Python backend logs for execution errors
- Verify database connections working
- Check if Cohere API key is valid
- Look for callback errors in console

### Polling Not Starting
- Verify task created successfully
- Check if polling interval stored in Map
- Look for errors in `startTaskPolling()` function

### Agents Not Executing
- Check if `execute_task_workflow()` started
- Verify all agent Python files exist
- Check for Python import errors
- Review agent output in logs

---

## Next Steps (Optional Improvements)

1. **Move Polling to Python Backend**
   - Implement WebSocket broadcast from FastAPI
   - Reduces Node.js CPU usage

2. **Add Task Queuing**
   - Implement RabbitMQ consumer worker
   - Support concurrent task execution

3. **Add Progress Tracking**
   - Track steps within each agent
   - Send more granular progress events

4. **Add Error Recovery**
   - Automatic retry on agent failure
   - Alternative agent selection

5. **Add Performance Metrics**
   - Time per agent
   - Resource usage tracking
   - Cost estimation

---

## Files Modified

1. ✅ `/client/src/hooks/useSocket.js` (CREATED)
2. ✅ `/server/routes/taskRoutes.js` (ENHANCED)
3. ✅ `/Ai-Engine/main.py` (ENHANCED)
4. ✅ `/Ai-Engine/orchestrator/orchestrator.py` (ENHANCED)

## No Files Broken
- ✅ `/server/server.js` - Socket.IO setup unchanged
- ✅ `/client/src/store/opsStore.js` - Zustand store works with new updates
- ✅ `/client/src/app/opsRoom/page.jsx` - Now properly uses useSocket hook

---

All issues have been resolved. The system now provides real-time updates from backend agent execution to the frontend UI via Socket.IO.
