import { FastifyPluginAsync } from 'fastify';
import { instanceOfNodeError } from '@/utils/error-guards';
import { extractSessionFromStream } from '@/services/core/browser';

const uploadSessionRoute: FastifyPluginAsync = async (app) => {
  app.post(
    '/',
    {
      // only schema for swagger
      attachValidation: true,
      schema: {
        description:
          'Upload a zip contains the puppeteer profile do you want to use.',
        consumes: ['multipart/form-data'],
        body: {
          type: 'object',
          properties: {
            file: {
              isFile: true,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        app.log.debug('Waiting zip file');

        const file = await request.file();

        if (!file) {
          return reply.status(400).send({ error: 'Waiting zip file' });
        }

        // validate
        if (
          file.mimetype !== 'application/zip' &&
          file.mimetype !== 'application/x-zip-compressed'
        ) {
          return reply.status(400).send({ error: 'File must by a zip' });
        }

        // Usamos la función común para extraer el stream
        const extractedFiles = await extractSessionFromStream(file.file);

        return reply.send({
          status: true,
          message: 'Success!',
          extractedFiles,
        });
      } catch (error) {
        app.log.error(error);

        if (!instanceOfNodeError(error)) {
          return reply.status(500).send({ error: 'Kaboom! Internal error' });
        }

        if (error.code === 'ERR_STREAM_PREMATURE_CLOSE') {
          return reply
            .status(400)
            .send({ error: 'Incomplete or corrupted zip file.' });
        }

        return reply.status(500).send({
          error: 'Bum! Internal error',
        });
      }
    }
  );
};

export default uploadSessionRoute;
