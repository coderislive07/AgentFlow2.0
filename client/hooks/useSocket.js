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

    console.log('WebSocket: Connecting to', SOCKET_URL, 'for task:', taskId);

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket: Connected with ID:', socketRef.current?.id);

      socketRef.current.emit('join-task', taskId);
      console.log('WebSocket: Joined task:', taskId);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('WebSocket: Disconnected -', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket: Connection error -', error.message);
    });

    /**
     * TASK UPDATE
     */
    socketRef.current.on('task-update', (data) => {
      console.log('🔌 WS task-update:', data);
      updateFromServer(data);
    });

    /**
     * TASK PROGRESS
     */
    socketRef.current.on('task-progress', (data) => {
      console.log('🔌 WS task-progress:', data);
      updateFromServer(data);
    });

    /**
     * AGENT STATUS
     */
    socketRef.current.on(
      'agent-status-update',
      (data) => {
        console.log('🔌 WS agent-status-update:', data);
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
      console.log('🔌 WS agent-log:', data);
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
        console.log('🔌 WS workflow-complete:', data);
        setStatus(data.status);
        updateFromServer(data);
      }
    );

    return () => {
      console.log('WebSocket: Cleaning up for task:', taskId);

      if (socketRef.current) {
        socketRef.current.emit(
          'leave-task',
          taskId
        );

        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [taskId, updateFromServer, setStatus, addLog, updateAgentStatus]);

  return socketRef.current;
}