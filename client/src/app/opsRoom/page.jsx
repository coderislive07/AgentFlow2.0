"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { useOpsStore } from "../../store/opsStore"
import { submitTask } from "@/services/api"
import { useTaskPolling } from "@/hooks/useTaskPolling"
import { useSocket } from "@/hooks/useSocket"

import logo from "../../../public/logo.png"
import orch from "../../../public/Workers/orch.png"
import Planner from "../../../public/Workers/Planner.png"
import Developer from "../../../public/Workers/Developer.png"
import Researcher from "../../../public/Workers/Researcher.png"
import Tester from "../../../public/Workers/Tester.png"
import Reporter from "../../../public/Workers/Reporter.png"

const agents = [
  { id: "planner", displayName: "Planzilla", role: "Planner", image: Planner },
  { id: "researcher", displayName: "QueryLyn", role: "Researcher", image: Researcher },
  { id: "developer", displayName: "CodeWizard", role: "Developer", image: Developer },
  { id: "tester", displayName: "BugBuster", role: "Tester", image: Tester },
  { id: "reporter", displayName: "DataBard", role: "Reporter", image: Reporter },
]

const statusMap = {
  idle: { label: "Waiting", dot: "bg-slate-500", text: "text-slate-300" },
  pending: { label: "Queued", dot: "bg-slate-500", text: "text-slate-300" },
  todo: { label: "Waiting", dot: "bg-slate-500", text: "text-slate-300" },
  running: { label: "Running", dot: "bg-sky-400 animate-pulse", text: "text-sky-200" },
  done: { label: "Completed", dot: "bg-emerald-400", text: "text-emerald-200" },
  completed: { label: "Completed", dot: "bg-emerald-400", text: "text-emerald-200" },
  failed: { label: "Failed", dot: "bg-rose-500", text: "text-rose-200" },
}

function normalizeStatus(status) {
  if (!status) return "idle"

  if (
    status === "done" ||
    status === "completed"
  ) {
    return "completed"
  }

  if (
    status === "running" ||
    status === "in-progress"
  ) {
    return "running"
  }

  if (
    status === "todo" ||
    status === "pending" ||
    status === "idle"
  ) {
    return "todo"
  }

  return status
}

function badgeStyle(status) {
  return statusMap[normalizeStatus(status)] || statusMap.idle
}

function Section({ title, tasks, completed }) {
  return (
    <div>
      <h3 className="text-white text-lg mb-3">{title}</h3>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-blue-900/40 rounded-lg border border-blue-500/30"
          >
            <div className="flex items-center justify-between gap-2">
              <p className={`text-white ${completed ? "line-through opacity-70" : ""}`}>
                {t.assignedTo}
              </p>
              <span className={`text-xs font-semibold ${t.status === "completed" ? "text-emerald-300" : t.status === "running" ? "text-sky-300" : "text-slate-400"}`}>
                {t.status === "completed" ? "Completed" : t.status === "running" ? "Running" : "Waiting"}
              </span>
            </div>
            <p className="text-xs text-blue-300">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-blue-500/10 bg-slate-950/80 p-5">
      <p className="text-sm text-blue-300 uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

function OutputCard({ title, content }) {
  const displayContent =
    content && typeof content === 'object'
      ? JSON.stringify(content, null, 2)
      : content

  return (
    <div className="rounded-3xl border border-blue-500/10 bg-slate-950/80 p-5">
      <p className="text-sm text-blue-300 uppercase tracking-[0.2em]">{title}</p>
      <pre className="mt-3 min-h-[72px] whitespace-pre-wrap text-sm leading-6 text-slate-300">{displayContent}</pre>
    </div>
  )
}

export default function OpsRoom() {
  const router = useRouter()
  const logsEndRef = useRef(null)

  // Subscribe to store with individual selectors for proper reactivity
  const taskId = useOpsStore((state) => state.taskId)
  const status = useOpsStore((state) => state.status)
  const logs = useOpsStore((state) => state.logs)
  const agentStatus = useOpsStore((state) => state.agents)
  const setTask = useOpsStore((state) => state.setTask)
  const setTaskId = useOpsStore((state) => state.setTaskId)
  const setStatus = useOpsStore((state) => state.setStatus)
  const reset = useOpsStore((state) => state.reset)

  const [taskInput, setTaskInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [selectedAgents, setSelectedAgents] = useState([])

  useSocket(taskId)
  // Fallback polling if WebSocket fails
  useTaskPolling(taskId)

  useEffect(() => {
    console.log('🎨 Render: opsRoom updated with:', {
      taskId,
      status,
      logsCount: logs.length,
      agentStatuses: Object.entries(agentStatus || {}).map(([k, v]) => ({ [k]: v.status })),
    });
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, status, taskId, agentStatus])

  const toggleAgent = (id) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handleSubmitTask = async (e) => {
    e.preventDefault()
    if (!taskInput.trim()) return

    try {
      console.log('📝 Submitting task:', taskInput.trim());
      setIsSubmitting(true)
      // Reset state first
      reset()
      
      // Then set new task info
      setTask(taskInput.trim())
      setStatus("pending")

      // Submit to backend
      const response = await submitTask(taskInput.trim())
      console.log('📝 Task submitted, response:', response);
      const newTaskId =
      response.taskId || response.task_id

      console.log(
      "REAL TASK ID:",
      newTaskId
      )
      
      // Update with task ID and status
      console.log('📝 Setting new taskId:', newTaskId);
      setTaskId(newTaskId)
      setStatus("running")
      setTaskInput("")
      setShowNewChat(false)
    } catch (err) {
      console.error('Error submitting task:', err)
      setStatus("failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* -------- DERIVE TASKS FROM REAL LOGS -------- */
const tasks = agents.map((agent) => {

  const agentState = agentStatus?.[agent.id]

  const normalized = normalizeStatus(
    agentState?.status
  )

  const agentLogs = logs.filter((l) => {
    const name = l.agent?.toLowerCase() || ""

    return (
      name.includes(agent.id.toLowerCase()) ||
      name.includes(agent.displayName.toLowerCase()) ||
      name.includes(agent.role.toLowerCase())
    )
  })

  return {
    id: agent.id,

    title:
      agentLogs.at(-1)?.message ||
      `${agent.displayName} is processing...`,

    description:
      typeof agentState?.output === "string"
        ? agentState.output
        : JSON.stringify(agentState?.output || ""),

    status: normalized,

    assignedTo: agent.displayName,

    output: agentState?.output || "",

    badge: badgeStyle(normalized),

    timestamp:
      agentLogs.at(-1)?.timestamp || "",
  }
})

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "running")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="border-b border-blue-500/20 bg-white/5 backdrop-blur-xl px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/") }>
            <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center">
              <Image src={logo} alt="logo" className="h-6 w-6" />
            </div>
            <span className="text-white font-semibold">AgentFlow</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100">
            <span className="rounded-full bg-blue-500/20 px-3 py-1">Status: {status || "idle"}</span>
            {taskId && <span className="rounded-full bg-blue-500/10 px-3 py-1">Task ID: {taskId.slice(0, 8)}</span>}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-1/3 border-r border-blue-500/20 bg-white/5 backdrop-blur-xl flex flex-col relative">
          <button
            onClick={() => setShowNewChat(true)}
            className="absolute top-4 right-4 flex gap-2 px-3 py-1 text-sm text-white bg-blue-500/20 rounded-lg"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>

          {showNewChat && (
            <div className="p-4 mt-14 space-y-3">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-blue-500/30 rounded-2xl p-4 text-white placeholder:text-slate-500"
                placeholder="Enter your next orchestration request…"
              />
              <button
                onClick={handleSubmitTask}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-sky-400 text-white py-3 rounded-2xl font-semibold hover:from-blue-400 hover:to-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Launching workflow…" : "Submit Task"}
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 mt-14 space-y-6">
            <div className="rounded-3xl border border-blue-500/20 bg-slate-900/80 p-5 shadow-xl shadow-blue-950/30">
              <p className="text-sm text-blue-300 uppercase tracking-[0.3em]">Live Orchestrator</p>
              <h2 className="mt-3 text-white text-2xl font-semibold">Pipeline progress</h2>
              <p className="mt-2 text-sm text-slate-400">
                Agents are assigned, tracked, and updated while your workflow runs.
              </p>
              <div className="mt-5 rounded-2xl bg-slate-950/90 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Overall progress</span>
                  <span>{Math.round((completedTasks.length / agents.length) * 100)}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${(completedTasks.length / agents.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-slate-900/80 p-5 shadow-xl shadow-blue-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-blue-300 uppercase tracking-[0.3em]">Execution timeline</p>
                  <h2 className="mt-2 text-white text-xl font-semibold">Live activity feed</h2>
                </div>
                <div className="rounded-full bg-slate-700/70 px-3 py-1 text-xs text-slate-300">
                  {logs.length} events
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {logs.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-blue-500/20 bg-slate-950/70 p-6 text-slate-500">
                    Waiting for the orchestrator to receive a task.
                  </div>
                ) : (
                  logs.slice(-6).map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-3xl bg-slate-950/80 p-4 border border-blue-500/10">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                      <div>
                        <p className="text-sm text-white font-semibold">{log.agent}</p>
                        <p className="mt-1 text-sm text-slate-300">{log.message}</p>
                        <p className="mt-2 text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="border-b border-blue-500/20 bg-white/5 px-8 py-4 flex flex-wrap gap-4">
            {agents.map((agent) => {
              const currentStatus = agentStatus?.[agent.id]?.status || "idle"
              const style = badgeStyle(currentStatus)

              return (
                <div
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className="flex min-w-[180px] items-center gap-3 rounded-3xl border border-blue-500/20 bg-slate-950/90 p-4 hover:border-blue-300/40 cursor-pointer"
                >
                  <Image src={agent.image} alt={agent.displayName} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <p className="text-white font-semibold">{agent.displayName}</p>
                    <p className="text-xs text-slate-400">{agent.role}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      <span className={`${style.text}`}>{style.label}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-blue-500/20 bg-slate-900/80 p-6 shadow-xl shadow-blue-950/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-300 uppercase tracking-[0.3em]">Agent pipeline</p>
                    <h2 className="mt-2 text-white text-2xl font-semibold">Team execution status</h2>
                  </div>
                  <div className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-200">{status || "idle"}</div>
                </div>

                <div className="mt-8 space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="rounded-3xl border border-blue-500/10 bg-slate-950/70 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white font-semibold">{task.assignedTo}</p>
                          <p className="mt-1 text-sm text-slate-400">{task.title}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${task.status === "completed" ? "bg-emerald-500/15 text-emerald-200" : task.status === "running" ? "bg-sky-500/15 text-sky-200" : "bg-slate-700/20 text-slate-300"}`}>
                          {task.status === "completed" ? "Completed" : task.status === "running" ? "Running" : "Waiting"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-400">{task.description || "Awaiting agent activity..."}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-blue-500/20 bg-slate-900/80 p-6 shadow-xl shadow-blue-950/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-300 uppercase tracking-[0.3em]">Live analytics</p>
                    <h2 className="mt-2 text-white text-2xl font-semibold">Workflow insights</h2>
                  </div>
                  <div className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-200">{completedTasks.length}/{agents.length} finished</div>
                </div>

                <div className="mt-8 space-y-4">
                  <StatCard label="Current step" value={inProgressTasks[0]?.assignedTo || "Queued"} />
                  <StatCard label="Next step" value={todoTasks[0]?.assignedTo || "Waiting"} />
                  <StatCard label="Last event" value={logs.at(-1)?.message || "No events yet"} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-slate-900/80 p-6 shadow-xl shadow-blue-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-blue-300 uppercase tracking-[0.3em]">Final output</p>
                  <h2 className="mt-2 text-white text-2xl font-semibold">Deliverable summary</h2>
                </div>
                <span className="rounded-full bg-slate-700/60 px-4 py-2 text-sm text-slate-300">
                  {status === "completed" ? "Ready" : "Preparing"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <OutputCard title="Plan" content={agentStatus?.planner?.output || "Plan details will appear here."} />
                <OutputCard title="Research" content={agentStatus?.researcher?.output || "Research highlights will appear here."} />
                <OutputCard title="Code" content={agentStatus?.developer?.output || "Implementation summary will appear here."} />
                <OutputCard title="Tests" content={agentStatus?.tester?.output || "QA notes will appear here."} />
                <OutputCard title="Report" content={agentStatus?.reporter?.output || "Report brief will appear here."} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
