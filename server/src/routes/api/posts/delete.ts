import { queueManager } from '@/services/queue/manager';
import { FastifyPluginAsync } from 'fastify';

const deletePostRoute: FastifyPluginAsync = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        body: {
          type: 'array',
          items: {
            type: 'object',
            required: ['groupId', 'postId'],
            properties: {
              groupId: { type: 'string' },
              postId: { type: 'string' },
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
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        postId: string;
        groupId: string;
      }[];

      const taskId = queueManager.addTask({
        type: 'POST_DELETE',
        data: {
          posts: body,
        },
      });

      return reply.status(200).send({
        success: true,
        taskId,
      });
    }
  );
};

export default deletePostRoute;
