import { queueManager } from '@/services/queue/manager';
import { instanceToPlain } from 'class-transformer';
import { FastifyPluginAsync } from 'fastify';

const taskRoute: FastifyPluginAsync = async (app) => {
  app.get(
    '/tasks',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'boolean' },
              queue: {
                type: 'object',
                properties: {
                  pending: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      pairs: {
                        type: 'array',
                        items: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                    },
                  },
                  processing: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      pairs: {
                        type: 'array',
                        items: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                    },
                  },
                  completed: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      pairs: {
                        type: 'array',
                        items: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_, reply) => {
      reply.send({
        status: true,
        queue: await queueManager.getQueueStatus(),
      });
    }
  );

  app.delete(
    '/tasks',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'boolean' },
              count: { type: 'number' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (_, reply) => {
      const count = (await queueManager.getQueueStatus()).completed.count;
      await queueManager.clearCompletedTasks();
      reply.send({
        status: true,
        count,
        message: 'Remove completed tasks',
      });
    }
  );

  app.get(
    '/tasks/:taskId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            taskId: { type: 'string' },
          },
          required: ['taskId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'boolean' },
              task: { $ref: 'QueueTask' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { taskId } = req.params as { taskId: string };

      const task = queueManager.getTask(taskId);
      if (!task) return reply.status(404).send({ error: 'Task not found' });
      reply.status(200).send({
        status: true,
        task: {
          id: task.id,
          data: task.data,
          result: task.result,
          error: task.error,
        },
      });
    }
  );
};

export default taskRoute;
