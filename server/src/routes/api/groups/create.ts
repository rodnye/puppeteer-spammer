import { saveGroup } from '@/services/store/groups/save';
import { FbGroupDto } from '@/services/facebook/dto';
import { FastifyPluginAsync } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { existsGroup } from '@/services/store/groups/get';

const attachGroupRoute: FastifyPluginAsync = async (app) => {
  app.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              default: [],
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as {
          id: string;
          name: string;
          tags: string[];
        };

        reply.log.debug(`Saving group: ${body.name} (${body.id})`);
        if (await existsGroup(body.id)) {
          throw new Error('the group already exists');
        }
        await saveGroup(
          plainToInstance(FbGroupDto, {
            id: body.id,
            name: body.name,
            tags: body.tags,
          })
        );

        return reply.status(200).send({
          success: true,
          message: 'Group attached successfully',
          groupId: body.id,
        });
      } catch (error) {
        console.error('Error in /groups/attach endpoint:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to attach group',
        });
      }
    }
  );
};

export default attachGroupRoute;
