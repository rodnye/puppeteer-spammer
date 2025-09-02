import { existsPost } from '@/services/store/posts/find';
import { logger } from '../../logger';
import { deletePostFromFb } from '@/services/scraper/posts/delete';
import { deletePost } from '@/services/store/posts/delete';

export interface PostDeleteData {
  posts: {
    postId: string;
    groupId: string;
  }[];
}

export type PostDeleteResult = null;

export const processPostDelete = async ({
  posts,
}: PostDeleteData): Promise<PostDeleteResult> => {
  for (const { postId, groupId } of posts) {
    if (!(await existsPost(groupId, postId))) {
      throw new Error(`Post not found in ${postId}`);
    }

    await deletePostFromFb(groupId, postId);

    logger.debug('Deleting post from redis...');
    await deletePost(groupId, postId);
  }

  return null;
};
