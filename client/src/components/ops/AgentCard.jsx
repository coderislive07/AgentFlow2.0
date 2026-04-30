'use client';

import { Agent } from '@/store/opsStore';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const getStatusIcon = () => {
    switch (agent.status) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Zap className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'idle':
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (agent.status) {
      case 'done':
        return 'Completed';
      case 'running':
        return 'Running';
      case 'failed':
        return 'Failed';
      case 'idle':
      default:
        return 'Idle';
    }
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case 'done':
        return 'border-green-500/30 bg-green-500/5';
      case 'running':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'failed':
        return 'border-red-500/30 bg-red-500/5';
      case 'idle':
      default:
        return 'border-muted/30 bg-muted/5';
    }
  };

  return (
    <Card
      className={cn(
        'p-4 border-2 transition-all',
        getStatusColor()
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
          </div>
          {getStatusIcon()}
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-background border border-border">
            {getStatusText()}
          </div>
        </div>
        {agent.output && (
          <div className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border/50">
            {typeof agent.output === 'string'
              ? agent.output
              : JSON.stringify(agent.output).slice(0, 100)}
          </div>
        )}
      </div>
    </Card>
  );
}
