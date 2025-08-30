import { deleteGroup } from '@/services/store/groups/delete';
import { FastifyPluginAsync } from 'fastify';
import { existsGroup } from '@/services/store/groups/get';

const detachGroupRoute: FastifyPluginAsync = async (app) => {
  app.delete(
    '/:groupId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['groupId'],
          properties: {
            groupId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const params = request.params as {
          groupId: string;
        };

        reply.log.debug(`Detaching group: ${params.groupId}`);

        // Verificar si el grupo existe antes de intentar eliminarlo
        if (!(await existsGroup(params.groupId))) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Group not found',
          });
        }

        // Eliminar el grupo y todos sus posts asociados
        await deleteGroup(params.groupId);

        return reply.status(200).send({
          success: true,
          message: 'Group detached successfully',
          groupId: params.groupId,
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
