import { FastifyPluginAsync } from 'fastify';
import { queueManager } from '@/services/queue/manager';

const attachGroupRoute: FastifyPluginAsync = async (app) => {
  app.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['groupId'],
          properties: {
            groupId: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        groupId: string;
        tags: string[];
      };

      const taskId = queueManager.addTask({
        type: 'GROUP_CREATE',
        data: body,
      });

      return reply.status(200).send({
        success: true,
        taskId,
      });
    }
  );
};

export default attachGroupRoute;
