const API_BASE = import.meta.env.VITE_API_BASE || '';

const request = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

export const api = {
  ping: () => request('/api/ping'),

  getTasks: () => request('/api/tasks'),

  deleteTasks: () => request('/api/tasks', { method: 'DELETE', body: '{}' }),

  getTask: (taskId: string) => request(`/api/tasks/${taskId}`),

  getComments: (groupId: string, postId: string) =>
    request(`/api/comments/${groupId}/${postId}`),

  getGroups: (tag?: string) => {
    const params = tag ? `?tag=${encodeURIComponent(tag)}` : '';
    return request(`/api/groups/${params}`);
  },

  createGroup: (groupId: string, tags: string[] = []) =>
    request('/api/groups/', {
      method: 'POST',
      body: JSON.stringify({ groupId, tags }),
    }),

  deleteGroups: (groupIds: string[]) =>
    request('/api/groups/', {
      method: 'DELETE',
      body: JSON.stringify({ groupIds }),
    }),

  createPost: (formData: FormData) =>
    request('/api/posts/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    }),

  deletePosts: (posts: { groupId: string; postId: string }[]) =>
    request('/api/posts/', {
      method: 'DELETE',
      body: JSON.stringify(posts),
    }),

  uploadSession: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/session/', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};
