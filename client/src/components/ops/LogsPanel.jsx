'use client';

import { useEffect, useRef } from 'react';
import { useOpsStore } from '@/store/opsStore';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/common/Heading';

const AGENT_COLORS: Record<string, string> = {
  'orchestrator': 'text-purple-500',
  'PlanZilla': 'text-blue-500',
  'QueryLyn': 'text-cyan-500',
  'CodeWizard': 'text-amber-500',
  'BugBuster': 'text-rose-500',
  'DataBard': 'text-emerald-500',
  'system': 'text-gray-500',
};

export function LogsPanel() {
  const logs = useOpsStore((state) => state.logs);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        setTimeout(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }, 0);
      }
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <Heading level={3} className="text-foreground">
        Live Execution Logs
      </Heading>
      <Card className="flex-1 overflow-hidden bg-background/50 border-border/50">
        <ScrollArea ref={scrollRef} className="h-full w-full">
          <div className="p-4 font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">Waiting for task execution...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-muted-foreground min-w-fit">[{log.timestamp}]</span>
                  <span className={`font-semibold min-w-fit ${AGENT_COLORS[log.agent] || 'text-gray-400'}`}>
                    {log.agent}:
                  </span>
                  <span className="text-foreground flex-1">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
