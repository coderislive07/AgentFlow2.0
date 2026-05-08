const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }
  return response.json();
}

export const submitTask = async (input) => {
  const response = await fetch(`${API_BASE}/api/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task : input }),
  });

  return handleResponse(response);
};

export const getTaskStatus = async (taskId) => {
  const response = await fetch(`${API_BASE}/api/task/${taskId}`);
  return handleResponse(response);
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
