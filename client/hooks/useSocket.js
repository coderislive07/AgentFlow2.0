'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useOpsStore } from '@/store/opsStore';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5001';

export function useSocket(taskId) {
  const socketRef = useRef();

  const {
    updateFromServer,
    setStatus,
    addLog,
    updateAgentStatus,
  } = useOpsStore();

  useEffect(() => {
    if (!taskId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    console.log('Connecting socket for task:', taskId);

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');

      socketRef.current.emit('join-task', taskId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    /**
     * TASK UPDATE
     */
    socketRef.current.on('task-update', (data) => {
      console.log('TASK UPDATE:', data);

      updateFromServer(data);
    });

    /**
     * TASK PROGRESS
     */
    socketRef.current.on('task-progress', (data) => {
      console.log('TASK PROGRESS:', data);

      updateFromServer(data);
    });

    /**
     * AGENT STATUS
     */
    socketRef.current.on(
      'agent-status-update',
      (data) => {
        console.log(
          'AGENT STATUS UPDATE:',
          data
        );

        updateAgentStatus(
          data.agent.toLowerCase(),
          data.status,
          data.output
        );
      }
    );

    /**
     * LOG EVENTS
     */
    socketRef.current.on('agent-log', (data) => {
      console.log('AGENT LOG:', data);

      addLog(
        data.timestamp,
        data.agent.toLowerCase(),
        data.message
      );
    });

    /**
     * WORKFLOW COMPLETE
     */
    socketRef.current.on(
      'workflow-complete',
      (data) => {
        console.log(
          'WORKFLOW COMPLETE:',
          data
        );

        setStatus(data.status);

        updateFromServer(data);
      }
    );

    return () => {
      console.log(
        'Cleaning socket for task:',
        taskId
      );

      if (socketRef.current) {
        socketRef.current.emit(
          'leave-task',
          taskId
        );

        socketRef.current.disconnect();

        socketRef.current = null;
      }
    };
  }, [taskId]);

  return socketRef.current;
}