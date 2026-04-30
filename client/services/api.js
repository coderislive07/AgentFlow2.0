const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const submitTask = async (task) => {
  const response = await fetch(`${API_BASE}/api/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit task');
  }

  return response.json();
};

export const getTaskStatus = async (taskId) => {
  const response = await fetch(`${API_BASE}/api/task/${taskId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch task status');
  }

  return response.json();
};

export const getMemory = async (taskId) => {
  const response = await fetch(`${API_BASE}/api/memory/${taskId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch memory');
  }

  return response.json();
};
