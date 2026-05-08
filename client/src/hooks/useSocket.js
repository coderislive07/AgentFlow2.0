'use client';

import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useOpsStore } from '@/store/opsStore';

export function useSocket(taskId) {
  const socketRef = useRef(null);
  const { addLog, updateAgentStatus, setStatus, setOutput } = useOpsStore();

  useEffect(() => {
    if (!taskId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to Socket.IO server
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Join task room
      socketRef.current.emit('join-task', taskId);
      console.log(`[Socket] Joined task room: task-${taskId}`);
    }

    const socket = socketRef.current;

    // Handle task creation event
    socket.on('task-created', (data) => {
      console.log('[Socket] task-created:', data);
    });

    // Handle real-time task updates
    socket.on('task-update', (data) => {
      console.log('[Socket] task-update:', data);
      if (data.status) {
        setStatus(data.status);
      }
    });

    // Handle agent status updates (from BaseAgent broadcast)
    socket.on('agent-status-update', (data) => {
      console.log('[Socket] agent-status-update:', data);
      const agentKey = data.agent?.toLowerCase() || data.data?.agent?.toLowerCase();
      const status = data.status || data.data?.status;
      const output = data.output || data.data?.output;
      
      if (agentKey && status) {
        if (status === 'running') {
          updateAgentStatus(agentKey, 'in-progress', output);
          if (data.message) {
            addLog(new Date().toISOString(), agentKey, data.message);
          }
        } else if (status === 'done' || status === 'completed') {
          updateAgentStatus(agentKey, 'completed', output);
          if (data.message) {
            addLog(new Date().toISOString(), agentKey, data.message);
          }
        }
      }
    });

    // Handle agent execution start
    socket.on('agent-start', (data) => {
      console.log('[Socket] agent-start:', data);
      const agentKey = data.agent?.toLowerCase() || data.agent_name?.toLowerCase();
      if (agentKey) {
        updateAgentStatus(agentKey, 'in-progress', data.output || data.data);
        if (data.message) {
          addLog(new Date().toISOString(), data.agent || data.agent_name, data.message);
        }
      }
    });

    // Handle agent progress/logs
    socket.on('agent-log', (data) => {
      console.log('[Socket] agent-log:', data);
      const agentKey = data.agent?.toLowerCase() || data.agent_name?.toLowerCase();
      if (agentKey && data.message) {
        addLog(new Date().toISOString(), data.agent || data.agent_name, data.message);
      }
    });

    // Handle agent completion
    socket.on('agent-complete', (data) => {
      console.log('[Socket] agent-complete:', data);
      const agentKey = data.agent?.toLowerCase() || data.agent_name?.toLowerCase();
      if (agentKey) {
        updateAgentStatus(agentKey, 'completed', data.output || data.result);
        if (data.message) {
          addLog(new Date().toISOString(), data.agent || data.agent_name, data.message);
        }
      }
    });

    // Handle task progress updates
    socket.on('task-progress', (data) => {
      console.log('[Socket] task-progress:', data);
      if (data.logs) {
        data.logs.forEach((log) => {
          addLog(log.timestamp || new Date().toISOString(), log.agent, log.message);
        });
      }
      if (data.agentStatus) {
        Object.entries(data.agentStatus).forEach(([key, agent]) => {
          updateAgentStatus(key, agent.status, agent.output);
        });
      }
    });

    // Handle workflow completed
    socket.on('workflow-complete', (data) => {
      console.log('[Socket] workflow-complete:', data);
      setStatus('completed');
      if (data.output) {
        setOutput(data.output);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('[Socket] error:', error);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] disconnected');
    });

    socket.on('connect', () => {
      console.log('[Socket] connected:', socket.id);
      // Re-join room on reconnection
      if (taskId) {
        socket.emit('join-task', taskId);
      }
    });

    return () => {
      if (socket) {
        socket.emit('leave-task', taskId);
        // Don't disconnect here, just leave the room
        // This allows the socket to be reused for other tasks
      }
    };
  }, [taskId, addLog, updateAgentStatus, setStatus, setOutput]);

  return socketRef.current;
}
