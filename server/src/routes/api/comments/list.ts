import { getCommentsFromFb } from '@/services/facebook/comments/get';
import { FbPostDto } from '@/services/facebook/dto';
import { existsPost } from '@/services/store/posts/get';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { FastifyPluginAsync } from 'fastify';

const listCommentsRoute: FastifyPluginAsync = async (app) => {
  app.get(
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
          groupId: string;
          postId: string;
        };

        reply.log.debug('Getting Facebook comments');
        if (!(await existsPost(params.groupId, params.postId))) {
          throw new Error('Post not found');
        }
        const post = plainToInstance(FbPostDto, {
          id: params.postId,
          groupId: params.groupId,
        });

        reply.log.debug(`Fetching comments from post: ${post.url}`);

        // Obtener los comentarios
        const comments = await getCommentsFromFb(post);

        return reply.status(200).send({
          success: true,
          comments: comments.map((c) => ({
            simpleDate: c.simpleDate,
            author: c.author,
            authorUrl: c.authorUrl,
            comment: c.comment,
            commentUrl: c.url,
          })),
          count: comments.length,
          postUrl: post.url,
          message: 'Facebook comments retrieved successfully',
        });
      } catch (error) {
        console.error('Error in /comments endpoint:', error);

        if (
          error.message?.includes('timeout') ||
          error.message?.includes('navigation')
        ) {
          return reply.status(408).send({
            error: 'Request Timeout',
          });
        }

        return reply.status(500).send({
          error: 'Internal Server Error',
        });
      }
    }
  );
};

export default listCommentsRoute;
