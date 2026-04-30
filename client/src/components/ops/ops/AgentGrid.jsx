'use client';

import { useOpsStore } from '@/store/opsStore';
import { AgentCard } from './AgentCard';
import { Heading } from '@/components/common/Heading';

export function AgentGrid() {
  const agents = useOpsStore((state) => state.agents);

  return (
    <div className="space-y-4">
      <Heading level={3} className="text-foreground">
        Agent Status Grid
      </Heading>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(agents).map(([key, agent]) => (
          <AgentCard key={key} agent={agent} />
        ))}
      </div>
    </div>
  );
}
