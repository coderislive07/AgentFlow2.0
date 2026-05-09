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
        console.log('Polling stopped: no taskId');
      }
      return;
    }

    console.log('Starting polling for taskId:', taskId);

    const poll = async () => {
      try {
        const data = await getTaskStatus(taskId);
        
        console.log('⏱️ Polling got data:', {
          taskId,
          status: data.status,
          agentCount: Object.keys(data.agentStatus || {}).length,
          logCount: (data.logs || []).length,
        });

        updateFromServer(data);

        if (data.status === 'completed' || data.status === 'failed') {
          console.log(`⏱️ Polling: Task finished with status: ${data.status}`);
          setStatus(data.status === 'completed' ? 'completed' : 'failed');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          return;
        }

        attemptRef.current++;

        if (attemptRef.current >= MAX_ATTEMPTS) {
          console.warn(`⏱️ Polling: Max attempts (${MAX_ATTEMPTS}) reached`);
          setStatus('completed');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
        }
      } catch (error) {
        console.error('⏱️ Polling error:', error.message);
        attemptRef.current++;

        if (attemptRef.current >= MAX_ATTEMPTS) {
          console.error(`⏱️ Polling: Failed after ${MAX_ATTEMPTS} attempts`);
          setStatus('failed');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
        }
      }
    };

    // Initial poll
    poll();

    // Set up interval
    pollingRef.current = setInterval(poll, 500);

    return () => {
      console.log('Cleaning up polling for taskId:', taskId);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [taskId, updateFromServer, setStatus]);
}
