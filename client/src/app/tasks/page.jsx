"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/services/api";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        setTasks(response.tasks || []);
      } catch (err) {
        setError(err.message || "Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Task dashboard</p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Monitor every workflow in one place.
          </h1>
        </div>
        <Link
          href="/opsRoom"
          className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500/90"
        >
          Submit new task
        </Link>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-border/70 bg-white/5 p-8 text-center text-foreground/80">Loading tasks...</div>
      ) : error ? (
        <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-[2rem] border border-border/70 bg-white/5 p-8 text-center text-foreground/75">
          No tasks have been submitted yet. Head to OpsRoom to start a new workflow.
        </div>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-[2rem] border border-border/60 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">{task.status}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">{task.input}</h2>
                </div>
                <div className="space-y-2 text-right text-sm text-foreground/70">
                  <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>
                  <p>ID: {task.id.slice(0, 8)}…</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-foreground/75">{task.summary}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
