// Shared API configuration and utilities

// In production the frontend is served by the same Express server,
// so we use a relative URL. During local dev we point to the backend port.
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://localhost:5001/api' : '/api'
);

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

export function apiGet(endpoint: string) {
  return apiCall(endpoint, { method: 'GET' });
}

export function apiPost(endpoint: string, data: any) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiPut(endpoint: string, data: any) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function apiDelete(endpoint: string) {
  return apiCall(endpoint, { method: 'DELETE' });
}
