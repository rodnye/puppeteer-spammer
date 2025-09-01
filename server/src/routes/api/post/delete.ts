import { deletePost } from '@/services/facebook/post/delete';
import { FastifyPluginAsync } from 'fastify';

const deletePostRoute: FastifyPluginAsync = async (app) => {
  app.post(
    '/delete',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            postPath: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as { postPath: string };
        await deletePost(body.postPath);

        return reply.status(200).send({
          success: true,
          message: 'Post navigation initiated successfully',
        });
      } catch (error) {
        console.error('Error in /post endpoint:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to navigate to post',
        });
      }
    }
  );
};

export default deletePostRoute;
