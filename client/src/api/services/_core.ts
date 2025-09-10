const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * @throws {Response}
 */
export const request = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) throw response;
  
  return response.json();
};
