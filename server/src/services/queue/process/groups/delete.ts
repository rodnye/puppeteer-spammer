import { existsGroup } from '@/services/store/groups/find';
import { logger } from '../../logger';
import { deleteGroup } from '@/services/store/groups/delete';

export interface GroupDeleteData {
  groupIds: string[];
}

export type GroupDeleteResult = null;

export const processGroupDelete = async ({
  groupIds,
}: GroupDeleteData): Promise<GroupDeleteResult> => {
  for (const groupId of groupIds) {
    logger.debug(`Deleting group: ${groupId}`);
    
    // first check of exists
    if (!(await existsGroup(groupId))) {
      throw new Error(`The group ${groupId} not exists`);
    }

    await deleteGroup(groupId);
  }

  return null;
};
