const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔴 API Error:', errorText);
    throw new Error(errorText || "API request failed");
  }
  const json = await response.json();
  console.log('🟢 API Response:', json);
  return json;
}

export const submitTask = async (task) => {
  console.log('📤 Submitting task:', task);
  const response = await fetch(`${API_BASE}/api/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task }),
  });

  return handleResponse(response);
};

export const getTaskStatus = async (taskId) => {
  const response = await fetch(`${API_BASE}/api/task/${taskId}`);
  const data = await handleResponse(response);
  console.log('📊 Task Status Data:', { taskId, status: data.status, agentCount: Object.keys(data.agentStatus || {}).length, logCount: (data.logs || []).length });
  return data;
};

export const getTasks = async () => {
  const response = await fetch(`${API_BASE}/api/tasks`);
  return handleResponse(response);
};

export const getMemory = async (taskId) => {
  const url = taskId ? `${API_BASE}/api/memory/${taskId}` : `${API_BASE}/api/memory`;
  const response = await fetch(url);
  return handleResponse(response);
};
