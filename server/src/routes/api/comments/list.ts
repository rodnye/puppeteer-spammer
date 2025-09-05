import { getCommentsFromFb } from '@/services/scraper/comments/get';
import { FbPostDto } from '@/services/scraper/dto';
import { existsPost } from '@/services/store/posts/find';
import { parseDto } from '@/utils/parse-dto';
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
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              comments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    simpleDate: { type: 'string' },
                    author: { type: 'string' },
                    authorUrl: { type: 'string' },
                    comment: { type: 'string' },
                    commentUrl: { type: 'string' },
                  },
                  required: [
                    'simpleDate',
                    'author',
                    'authorUrl',
                    'comment',
                    'commentUrl',
                  ],
                },
              },
              count: { type: 'number' },
              postUrl: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['success', 'comments', 'count', 'postUrl', 'message'],
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
          },
          408: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
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
        const post = parseDto(FbPostDto, {
          postId: params.postId,
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
