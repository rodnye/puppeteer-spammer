import { FastifyPluginAsync } from 'fastify';
import { createPostFromFb } from '@/services/facebook/posts/create';
import { unlink } from 'fs/promises';
import { existsGroup } from '@/services/store/groups/get';
import { savePost } from '@/services/store/posts/save';
import { instanceToPlain } from 'class-transformer';

const createPostRoute: FastifyPluginAsync = async (app) => {
  app.post(
    '/',
    {
      schema: {
        description:
          'Publicar un mensaje con archivos adjuntos en un grupo de Facebook',
        consumes: ['multipart/form-data'],
        body: {
          type: 'object',
          required: ['groupId', 'message'],
          properties: {
            groupId: {
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
            tags: {
              type: 'array',
            },
            desc: {
              type: 'string',
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
        const body = request.body as {
          groupId: string;
          message: string;
          tags?: string;
          desc?: string;
        };
        fileUris = files.map((file) => file.filepath);

        if (!(await existsGroup(body.groupId))) {
          throw new Error(`Group ${body.groupId} not register yet`);
        }

        const post = await createPostFromFb(
          body.groupId,
          body.message,
          fileUris
        );

        post.desc = body.desc || '';
        post.tags = body.tags?.split(",") || [];

        reply.log.debug('Saving in redis the post');
        await savePost(post);

        reply.send({ success: true, post: instanceToPlain(post) });
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
};

export default createPostRoute;
