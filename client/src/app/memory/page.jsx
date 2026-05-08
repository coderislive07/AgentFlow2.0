"use client";

import { useEffect, useState } from "react";
import { getMemory } from "@/services/api";

export default function MemoryPage() {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const data = await getMemory();
        setMemory(data.memory || null);
      } catch (err) {
        setError(err.message || "Unable to load memory.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Memory system</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Context, history, and reusable intelligence.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/75">
          View the current task memory snapshot and see how AgentFlow preserves reasoning across workflows.
        </p>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-border/70 bg-white/5 p-8 text-center text-foreground/80">Loading memory data...</div>
      ) : error ? (
        <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">{error}</div>
      ) : !memory ? (
        <div className="rounded-[2rem] border border-border/70 bg-white/5 p-8 text-center text-foreground/75">
          No memory snapshot is available yet. Submit a task in OpsRoom to initialize the memory system.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Short-Term Memory</h2>
            <p className="mt-4 text-sm leading-7 text-foreground/75">{memory.shortTerm}</p>
          </div>
          <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Long-Term Memory</h2>
            <p className="mt-4 text-sm leading-7 text-foreground/75">{memory.longTerm}</p>
          </div>
          <div className="rounded-[2rem] border border-border/60 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Semantic Memory</h2>
            <div className="mt-4 space-y-4">
              {memory.semantic?.map((item, idx) => (
                <div key={idx} className="rounded-3xl bg-background/80 p-4 text-sm text-foreground/80">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 leading-7">{item.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
