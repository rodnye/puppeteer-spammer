import { FastifyPluginAsync } from 'fastify';
import { createPostInGroup } from '@/services/facebook/post/create';
import { unlink } from 'fs/promises';

const createPostRoute: FastifyPluginAsync = async (app) => {
  app.post(
    '/create',
    {
      schema: {
        description:
          'Publicar un mensaje con archivos adjuntos en un grupo de Facebook',
        consumes: ['multipart/form-data'],
        body: {
          type: 'object',
          required: ['groupUrl', 'message'],
          properties: {
            groupUrl: {
              type: 'string',
              description:
                'URL del grupo de Facebook donde se publicará el mensaje',
              examples: ['https://facebook.com/groups/1234567890'],
            },
            message: {
              type: 'string',
              description: 'Contenido del mensaje a publicar',
              minLength: 1,
              examples: ['Vendo croquetas a 9000 dólares'],
            },
          },
          additionalProperties: true,
        },
      },
    },
    async (request, reply) => {
      let fileUris: string[] = [];

      try {
        const files = await request.saveRequestFiles();
        const body = request.body as { groupUrl?: string; message?: string };
        fileUris = files.map((file) => file.filepath);

        if (!body.groupUrl || !body.message) {
          return reply
            .status(400)
            .send({ error: 'groupUrl y message son requeridos' });
        }

        const postPath = await createPostInGroup(
          body.groupUrl,
          body.message,
          fileUris
        );
        reply.send({ success: true, postPath });
      } catch (err) {
        reply.log.error(err);

        if (err instanceof Error) {
          return reply.status(500).send({ error: err.message });
        }
        reply.status(500).send({ error: 'Internal Server Error' });
      } finally {
        for (const file of fileUris) {
          try {
            await unlink(file);
          } catch {}
        }
      }
    }
  );
}

export default createPostRoute;