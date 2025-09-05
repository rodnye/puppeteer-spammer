import { findAllGroups, findGroupsByTag } from '@/services/store/groups/find';
import { instanceToPlain } from 'class-transformer';
import { FastifyPluginAsync } from 'fastify';

const listGroupsRoute: FastifyPluginAsync = async (app) => {
  app.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            tag: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              count: { type: 'number' },
              filteredBy: { type: 'string' },
              groups: {
                type: 'array',
                items: { $ref: 'Group' },
              },
            },
            required: ['success', 'message', 'count', 'groups'],
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
        };
        reply.log.debug('Listing groups');
        // Si se filtra por tag
        if (query.tag) {
          reply.log.debug(`Filtering groups by tag: ${query.tag}`);
          const groups = await findGroupsByTag(query.tag);
          return reply.status(200).send({
            success: true,
            message: 'Groups filtered by tag retrieved successfully',
            count: groups.length,
            filteredBy: query.tag,
            groups: groups.map((g) => instanceToPlain(g)),
          });
        }
        const allGroups = await findAllGroups();
        return reply.status(200).send({
          success: true,
          message: 'All groups retrieved successfully',
          count: allGroups.length,
          groups: allGroups.map((g) => instanceToPlain(g)),
        });
      } catch (error) {
        console.error('Error in /groups endpoint:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve groups',
        });
      }
    }
  );
};

export default listGroupsRoute;
