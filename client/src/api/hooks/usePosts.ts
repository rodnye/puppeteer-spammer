import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import { postsService } from '../services/posts';
import { Post } from '../../types';

export const usePosts = ({
  tag,
  pageIndex = 0,
  pageSize = 10,
}: {
  tag?: string;
  pageIndex: number;
  pageSize: number;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.POSTS, pageSize.toString(), pageIndex.toString(), tag],
    queryFn: () => postsService.listPosts(pageIndex, pageSize, tag),
    select: (data) =>
      data.data as {
        posts: Post[];
        pageIndex: number;
        pageCount: number;
        hasNext: { type: 'boolean' };
        hasPrev: { type: 'boolean' };
        filteredBy: { type: 'string' };
      },
  });

export const useCreatePosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (p: Parameters<typeof postsService.createPost>[0]) =>
      postsService.createPost(p),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GROUPS],
      });
    },
    onError: (error) => {
      console.error('Error creating group:', error);
    },
  });
};


export const useDeletePosts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsService.deletePosts,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.POSTS],
      });
    },
    onError: (error) => {
      console.error('Error deleting groups:', error);
    },
  });
};
