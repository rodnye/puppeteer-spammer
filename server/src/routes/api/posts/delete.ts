import { deletePostFromFb } from '@/services/facebook/posts/delete';
import { deletePost } from '@/services/store/posts/delete';
import { existsPost } from '@/services/store/posts/get';
import { FastifyPluginAsync } from 'fastify';

const deletePostRoute: FastifyPluginAsync = async (app) => {
  app.delete(
    '/:groupId/:postId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['groupId', 'postId'],
          properties: {
            groupId: { type: 'string' },
            postId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const params = request.params as {
          postId: string;
          groupId: string;
        };

        reply.log.debug(
          `Deleting post: ${params.postId} from group: ${params.groupId}`
        );

        if (!(await existsPost(params.groupId, params.postId))) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Post not found in database',
          });
        }

        await deletePostFromFb(params.groupId, params.postId);

        reply.log.debug('Deleting post from redis...');
        await deletePost(params.groupId, params.postId);

        return reply.status(200).send({
          success: true,
          message: 'Post deleted successfully',
          postId: params.postId,
          groupId: params.groupId,
        });
      } catch (error) {
        console.error('Error in /post/delete endpoint:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to delete post',
        });
      }
    }
  );
};

export default deletePostRoute;
