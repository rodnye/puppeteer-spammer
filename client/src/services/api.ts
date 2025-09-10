import { request } from '../api/services/_core';

/**
 * @deprecated
 */
export const api = {
  ping: () => request('/api/ping'),

  getTasks: () => request('/api/tasks'),

  deleteTasks: () => request('/api/tasks', { method: 'DELETE', body: '{}' }),

  getTask: (taskId: string) => request(`/api/tasks/${taskId}`),

  getComments: (groupId: string, postId: string) =>
    request(`/api/comments/${groupId}/${postId}`),

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
