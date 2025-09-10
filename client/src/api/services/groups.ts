import { request } from './_core';

export const groupsService = {
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
};
