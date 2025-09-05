import { deleteGroup } from '@/services/store/groups/delete';
import { FastifyPluginAsync } from 'fastify';
import { existsGroup } from '@/services/store/groups/find';
import { queueManager } from '@/services/queue/manager';

const detachGroupRoute: FastifyPluginAsync = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['groupIds'],
          properties: {
            groupIds: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              taskId: { type: 'string' },
            },
            required: ['success', 'taskId'],
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
      const { groupIds } = request.body as {
        groupIds: string[];
      };
      try {
        const taskId = queueManager.addTask({
          type: 'GROUP_DELETE',
          data: {
            groupIds,
          },
        });
        return reply.status(200).send({
          success: true,
          taskId,
        });
      } catch (error) {
        console.error('Error in /groups/detach endpoint:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to detach group',
        });
      }
    }
  );
};

export default detachGroupRoute;
