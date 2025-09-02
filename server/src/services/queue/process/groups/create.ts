import { existsGroup } from '@/services/store/groups/find';
import { FbGroupDto } from '@/services/scraper/dto';
import { logger } from '../../logger';
import { saveGroup } from '@/services/store/groups/save';
import { url2FbGroup } from '@/services/scraper/navigation';

export interface GroupCreateData {
  groupId: string;
  tags?: string[];
}

export type GroupCreateResult = FbGroupDto;

export const processGroupCreate = async ({
  groupId,
  tags = [],
}: GroupCreateData): Promise<GroupCreateResult> => {
  // first check of exists
  logger.debug(`Saving group: ${groupId}`);
  if (await existsGroup(groupId)) {
    throw new Error('The group already exists');
  }

  const group = await url2FbGroup(groupId);
  group.tags = tags;

  await saveGroup(group);

  return group;
};
