import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import { groupsService } from '../services/groups';
import { Group } from '../../types';

export const useGroups = (tag?: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GROUPS, tag],
    queryFn: () => groupsService.getGroups(tag),
    select: (data) => data.groups as Group[],
  });

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, tags }: { groupId: string; tags?: string[] }) =>
      groupsService.createGroup(groupId, tags),
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

export const useDeleteGroups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsService.deleteGroups,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GROUPS],
      });
    },
    onError: (error) => {
      console.error('Error deleting groups:', error);
    },
  });
};
