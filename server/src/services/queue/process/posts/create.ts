import { existsGroup } from '@/services/store/groups/find';
import { FbPostDto } from '@/services/scraper/dto';
import { createPostFromFb } from '@/services/scraper/posts/create';
import { savePost } from '@/services/store/posts/save';
import { randomUUID } from 'node:crypto';

export interface PostCreateData {
  groupIds: string[];
  message: string;
  desc?: string;
  tags?: string[];
  files?: string[];
}

export type PostCreateResult = FbPostDto[];

export const processPostCreate = async ({
  groupIds,
  message,
  desc = '',
  tags = [],
  files = [],
}: PostCreateData): Promise<PostCreateResult> => {
  // first check of exists
  for (const groupId of groupIds) {
    if (!(await existsGroup(groupId))) {
      throw new Error(`Group ${groupId} not register yet`);
    }
  }

  const posts: FbPostDto[] = [];
  const commonTag = randomUUID().split('-')[0];

  for (const groupId of groupIds) {
    try {
      const post = await createPostFromFb(groupId, message, files);

      post.desc = desc;
      post.tags = [commonTag, ...tags];
      await savePost(post);
      posts.push(post);
    } catch {}
  }

  return posts;
};
