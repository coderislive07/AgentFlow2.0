"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Send } from "lucide-react"

import { useOpsStore } from "../../../store/opsStore"
import { submitTask } from "../../../services/api"
import { useTaskPolling } from "@/hooks/useTaskPolling"

import logo from "../../../public/logo.png"
import orch from "../../../public/Workers/orch.png"
import Planner from "../../../public/Workers/Planner.png"
import Developer from "../../../public/Workers/Developer.png"
import Researcher from "../../../public/Workers/Researcher.png"
import Tester from "../../../public/Workers/Tester.png"
import Reporter from "../../../public/Workers/Reporter.png"

const agents = [
  { id: "planner", name: "Planzilla", role: "Planner", image: Planner },
  { id: "researcher", name: "QueryLyn", role: "Researcher", image: Researcher },
  { id: "coder", name: "CodeWizard", role: "Developer", image: Developer },
  { id: "tester", name: "BugBuster", role: "Tester", image: Tester },
  { id: "reporter", name: "DataBard", role: "Reporter", image: Reporter },
]

export default function OpsRoom() {
  const router = useRouter()
  const logsEndRef = useRef(null)

  const {
    taskId,
    status,
    logs,
    agents: agentStatus,
    setTask,
    setTaskId,
    setStatus,
    reset,
  } = useOpsStore()

  const [taskInput, setTaskInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [followUpInput, setFollowUpInput] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [selectedAgents, setSelectedAgents] = useState([])

  useTaskPolling(taskId)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const toggleAgent = (id) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handleSubmitTask = async (e) => {
    e.preventDefault()
    if (!taskInput.trim()) return

    try {
      setIsSubmitting(true)
      setTask(taskInput)
      setStatus("running")
      reset()

      const { taskId: newTaskId } = await submitTask(taskInput)
      setTaskId(newTaskId)
      setTaskInput("")
      setShowNewChat(false)
    } catch (err) {
      console.error(err)
      setStatus("failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* -------- DERIVE TASKS FROM REAL LOGS -------- */
  const tasks = agents.map((agent) => {
    const agentLogs = logs.filter(
      (l) => l.agent.toLowerCase() === agent.name.toLowerCase()
    )

    const aStatus = agentStatus?.[agent.id]?.status

    return {
      id: agent.id,
      title: agentLogs[0]?.message || "Waiting to start…",
      description: agentLogs.at(-1)?.message || "",
      status:
        aStatus === "running"
          ? "in-progress"
          : aStatus === "done"
          ? "completed"
          : "todo",
      assignedTo: agent.name,
      timestamp: agentLogs.at(-1)?.timestamp || "",
    }
  })

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-blue-500/20 bg-white/5 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center">
            <Image src={logo} alt="logo" className="h-6 w-6" />
          </div>
          <span className="text-white font-semibold">AgentFlow</span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* LEFT PANEL */}
        <div className="w-1/3 border-r border-blue-500/20 bg-white/5 backdrop-blur-xl flex flex-col relative">
          <button
            onClick={() => setShowNewChat(true)}
            className="absolute top-4 right-4 flex gap-2 px-3 py-1 text-sm text-white bg-blue-500/20 rounded-lg"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>

          {showNewChat && (
            <div className="p-4 mt-12 space-y-3">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                rows={3}
                className="w-full bg-white/10 rounded-lg p-3 text-white"
                placeholder="Enter task…"
              />
              <button
                onClick={handleSubmitTask}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                {isSubmitting ? "Submitting…" : "Submit Task"}
              </button>
            </div>
          )}

         <div className="flex-1 overflow-y-auto p-6 space-y-6 mt-14">
  {logs.map((log, idx) => {
    const agent = agents.find(
      (a) => a.name.toLowerCase() === log.agent.toLowerCase()
    )

    return (
      <div key={idx} className="flex gap-3">
        {/* Avatar */}
      <Image
  src={agent?.image || orch}
  alt={log.agent}
  className="w-9 h-9 rounded-full border border-blue-500"
/>


        {/* Content */}
        <div className="flex flex-col gap-1">
          {/* Name | Role | Status */}
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold texttext-sm leading-none">
              {log.agent}
            </p>

            {agent && agent.name.toLowerCase() !== "orchestrator" && (
    <p className="text-xs text-blue-400 mt-[2px]">
      | {agent.role}
    </p>
  )}

            {log.status && (
              <span className="ml-1 rounded-md bg-green-500/20 px-2 py-[2px] text-xs font-medium text-green-400">
                {log.status}
              </span>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-blue-200 leading-relaxed">
            {log.message}
          </p>

          {/* Timestamp */}
          <p className="text-xs text-blue-400">
            {log.timestamp}
          </p>
        </div>
      </div>
    )
  })}

  <div ref={logsEndRef} />
</div>


          <div className="p-4">
            <input
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              placeholder="Ask a follow-up…"
              className="w-full bg-white/10 rounded-xl px-4 py-2 text-white"
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col">
          {/* AGENTS BAR */}
          <div className="border-b border-blue-500/20 bg-white/5 px-8 py-4 flex gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Image src={agent.image} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-white font-medium">{agent.name}</p>
                  <p className="text-xs text-gray-300">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* TASK BOARD */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* TODO */}
            <Section title="📋 To Do" tasks={todoTasks} />
            <Section title="📊 In Progress" tasks={inProgressTasks} />
            <Section title="✓ Completed" tasks={completedTasks} completed />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------- TASK SECTION COMPONENT -------- */
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
            <p className={`text-white ${completed ? "line-through opacity-70" : ""}`}>
              {t.assignedTo}
            </p>
            <p className="text-xs text-blue-300">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
