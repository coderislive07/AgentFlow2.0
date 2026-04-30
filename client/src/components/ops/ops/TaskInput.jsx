'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOpsStore } from '@/store/opsStore';
import { submitTask } from '@/services/api';
import { useTaskPolling } from '@/hooks/useTaskPolling';
import { Play, Loader2 } from 'lucide-react';

export function TaskInput() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setTask, setTaskId, setStatus, reset } = useOpsStore();
  const taskId = useOpsStore((state) => state.taskId);
  const status = useOpsStore((state) => state.status);

  // Use polling hook
  useTaskPolling(taskId);

  const handleRunTask = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setTask(input);
      setStatus('running');
      reset();

      const { taskId: newTaskId } = await submitTask(input);
      setTaskId(newTaskId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting task:', error);
      setStatus('failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Task Input</h2>
        <Textarea
          placeholder="Enter your task here... e.g., Build a full-stack e-commerce app with auth"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status === 'running'}
          className="flex-1 resize-none font-mono text-sm"
        />
      </div>
      <Button
        onClick={handleRunTask}
        disabled={!input.trim() || isLoading || status === 'running'}
        className="w-full gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Task
          </>
        )}
      </Button>
    </div>
  );
}
