import { FastifyPluginAsync } from 'fastify';
import { parseMultipartMiddleware } from '@/middlewares/parseMultipart';
import { queueManager } from '@/services/queue/manager';

const createPostRoute: FastifyPluginAsync = async (app) => {
  type ParsedSchema = {
    groupIds: string[];
    message: string;
    desc?: string;
    tags?: string[];
    files?: string[];
  };
  const schema = {
    description:
      'Publish a post on the groups',
    consumes: ['multipart/form-data'],
    body: {
      type: 'object',
      required: ['groupIds', 'message'],
      properties: {
        groupIds: {
          type: 'array',
          items: { type: 'string', examples: ['12345678901'] },
          description: 'Group IDs to publish the same post content.',
        },
        message: {
          type: 'string',
          description: 'Post text content',
          minLength: 1,
          examples: ['Vendo croquetas a 9000 dólares'],
        },
        tags: {
          type: 'array',
          items: { type: 'string', examples: ['gastronomia', 'barato'] },
          description: 'tags to identify post (not facebook)',
        },
        desc: {
          type: 'string',
          description: 'A useful description for the post (not facebook)',
        },
        files: {
          type: 'array',
          items: { type: 'string', isFile: true },
          description: 'Images and videos to attach',
        },
      },
    },
  };

  app.post(
    '/',
    {
      // ignore default validation
      validatorCompiler: () => () => true,
      preHandler: [parseMultipartMiddleware<ParsedSchema>(schema)],
      schema,
    },
    async (request, reply) => {
      const body = request.body as ParsedSchema;

      const taskId = queueManager.addTask({
        type: 'POST_CREATE',
        data: {
          groupIds: body.groupIds,
          message: body.message,
          tags: body.tags,
          files: body.files,
        },
      });

      reply.send({ success: true, taskId });
    }
  );
};

export default createPostRoute;
