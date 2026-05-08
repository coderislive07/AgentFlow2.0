'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useOpsStore } from '@/store/opsStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export function useSocket(taskId) {
  const socketRef = useRef();
  const { updateFromServer, setStatus, addLog, updateAgentStatus } = useOpsStore();

  useEffect(() => {
    if (!taskId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Create socket connection
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current.emit('join-task', taskId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Listen for task updates
    socketRef.current.on('task-update', (data) => {
      console.log('Received task update:', data);
      updateFromServer(data);
    });

    // Listen for agent status updates
    socketRef.current.on('agent-status-update', (data) => {
      console.log('Received agent status update:', data);
      updateAgentStatus(data.agent, data.status, data.output);
    });

    // Listen for log updates
    socketRef.current.on('log-update', (data) => {
      console.log('Received log update:', data);
      addLog(data.timestamp, data.agent, data.message);
    });

    // Listen for task completion
    socketRef.current.on('task-completed', (data) => {
      console.log('Task completed:', data);
      setStatus('completed');
      updateFromServer(data);
    });

    // Listen for task failure
    socketRef.current.on('task-failed', (data) => {
      console.log('Task failed:', data);
      setStatus('failed');
      updateFromServer(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-task', taskId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [taskId, updateFromServer, setStatus, addLog, updateAgentStatus]);

  return socketRef.current;
}