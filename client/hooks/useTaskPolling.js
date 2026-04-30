'use client';

import { useEffect, useRef } from 'react';
import { useOpsStore } from '@/store/opsStore';
import { getTaskStatus } from '@/services/api';

export function useTaskPolling(taskId) {
  const pollingRef = useRef();
  const { updateFromServer, setStatus } = useOpsStore();
  const attemptRef = useRef(0);
  const MAX_ATTEMPTS = 120;

  useEffect(() => {
    if (!taskId) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      return;
    }

    const poll = async () => {
      try {
        const data = await getTaskStatus(taskId);

        const agents = {};
        if (data.agentStatus) {
          Object.entries(data.agentStatus).forEach(([key, agent]) => {
            agents[key] = {
              name: agent.output?.name || agent.output || 'Unknown',
              role: agent.output?.role || 'Agent',
              status: agent.status,
              output: agent.output,
            };
          });
        }

        updateFromServer({
          ...data,
          agentStatus: agents,
        });

        if (data.status === 'completed' || data.status === 'failed') {
          setStatus(data.status === 'completed' ? 'completed' : 'failed');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          return;
        }

        attemptRef.current++;

        if (attemptRef.current >= MAX_ATTEMPTS) {
          setStatus('completed');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        attemptRef.current++;

        if (attemptRef.current >= MAX_ATTEMPTS) {
          setStatus('failed');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
        }
      }
    };

    poll();

    pollingRef.current = setInterval(poll, 500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [taskId, updateFromServer, setStatus]);
}
