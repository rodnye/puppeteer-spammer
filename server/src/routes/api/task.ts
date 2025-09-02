import { queueManager } from '@/services/queue/manager';
import { instanceToPlain } from 'class-transformer';
import { FastifyPluginAsync } from 'fastify';

const taskRoute: FastifyPluginAsync = async (app) => {
  app.get('/tasks', async (req, reply) => {
    reply.send({
      status: true,
      queue: await queueManager.getQueueStatus(),
    });
  });

  app.delete('/tasks', async (req, reply) => {
    const count = (await queueManager.getQueueStatus()).completed.count;
    await queueManager.clearCompletedTasks();
    reply.send({
      status: true,
      count,
      message: 'Remove completed tasks',
    });
  });

  app.get(
    '/tasks/:taskId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            taskId: { type: 'string' },
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
        task: instanceToPlain(task),
      });
    }
  );
};

export default taskRoute;
