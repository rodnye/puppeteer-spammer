import { findPostsByTag } from '@/services/store/posts/find'; 
import { instanceToPlain } from 'class-transformer';
import { FastifyPluginAsync } from 'fastify';

const listPostsRoute: FastifyPluginAsync = async (app) => {
  app.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            tag: { type: 'string' },
            page: {
              type: 'number',
              minimum: 0,
              default: 0,
            },
            size: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  posts: {
                    type: 'array',
                    items: { $ref: 'Post' },
                  },
                  pageIndex: { type: 'number' },
                  pageCount: { type: 'number' },
                  hasNext: { type: 'boolean' },
                  hasPrev: { type: 'boolean' },
                  filteredBy: { type: 'string' },
                },
                required: [
                  'posts',
                  'pageIndex',
                  'pageCount',
                  'hasNext',
                  'hasPrev',
                ],
              },
            },
            required: ['success', 'message', 'data'],
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['error', 'message'],
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const query = request.query as {
          tag?: string;
          page?: number;
          size?: number;
        };

        reply.log.debug('Listing posts');

        const page = query.page ?? 0;
        const size = Math.min(Math.max(query.size ?? 10, 1), 100); // limite entre 1 y100

        const result = await findPostsByTag(query.tag, page, size);

        return reply.status(200).send({
          success: true,
          message: query.tag
            ? `Posts filtered by tag '${query.tag}' retrieved successfully`
            : 'All posts retrieved successfully',
          data: {
            posts: result.posts.map((p) => instanceToPlain(p)),
            pageIndex: result.pageIndex,
            pageCount: result.pageCount,
            hasNext: result.hasNext,
            hasPrev: result.hasPrev,
            filteredBy: query.tag || null,
          },
        });
      } catch (error) {
        reply.log.error('Error in /posts endpoint:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve posts',
        });
      }
    }
  );
};

export default listPostsRoute;
