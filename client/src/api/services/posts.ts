import { TaskExecResponse } from '../types';
import { request } from './_core';

export const postsService = {
  listPosts: (page: number, pageSize: number, tag?: string) => {
    const uri = new URLSearchParams();

    if (tag) uri.append('tag', tag);
    uri.append('page', String(page));
    uri.append('size', String(pageSize));

    return request(`/api/posts/?${uri.toString()}`);
  },

  createPost: (p: {
    groupIds: string[];
    message: string;
    tags?: string[];
    files?: File[];
    description?: string;
  }): Promise<TaskExecResponse> => {
    const formData = new FormData();

    formData.append('groupIds', JSON.stringify(p.groupIds));
    formData.append('message', p.message);

    if (p.tags) formData.append('tags', JSON.stringify(p.tags));
    if (p.description) formData.append('desc', p.description);

    if (p.files)
      p.files.forEach((file) => {
        formData.append('files', file);
      });
      
    return request('/api/posts/', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  deletePosts: (posts: { groupId: string; postId: string }[]) =>
    request('/api/posts/', {
      method: 'DELETE',
      body: JSON.stringify(posts),
    }),
};
