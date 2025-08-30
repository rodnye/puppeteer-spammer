import {
  getAllGroups,
  findGroupsByTag,
  countGroups,
} from '@/services/store/groups/get';
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
            countOnly: { type: 'boolean', default: false },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const query = request.query as {
          tag?: string;
          countOnly?: boolean;
        };

        reply.log.debug('Listing groups');

        // Si solo se solicita el conteo
        if (query.countOnly) {
          const totalCount = await countGroups();
          return reply.status(200).send({
            success: true,
            count: totalCount,
            message: 'Group count retrieved successfully',
          });
        }

        // Si se filtra por tag
        if (query.tag) {
          reply.log.debug(`Filtering groups by tag: ${query.tag}`);
          const groups = await findGroupsByTag(query.tag);
          return reply.status(200).send({
            success: true,
            groups: groups.map(g => instanceToPlain(g)),
            count: groups.length,
            filteredBy: query.tag,
            message: 'Groups filtered by tag retrieved successfully',
          });
        }

        // Listar todos los grupos
        const allGroups = await getAllGroups();
        return reply.status(200).send({
          success: true,
          groups: allGroups,
          count: allGroups.length,
          message: 'All groups retrieved successfully',
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
