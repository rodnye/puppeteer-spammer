import extract from 'extract-zip';
import path from 'node:path';
import { FastifyPluginAsync } from 'fastify';
import { createWriteStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { mkdir, readdir, rm, unlink } from 'node:fs/promises';
import { instanceOfNodeError } from '@/utils/error-guards';
import { PTR_SESSION_DIR, UPLOADS_DIR } from '@/services/core/config';

const uploadSessionRoute: FastifyPluginAsync = async (app): Promise<void> => {
  app.post('/', async (request, reply) => {
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

      try {
        if (existsSync(PTR_SESSION_DIR)) {
          await rm(PTR_SESSION_DIR, { recursive: true, force: true });
        }
        if (!existsSync(UPLOADS_DIR))
          await mkdir(UPLOADS_DIR, { recursive: true });
      } catch (error) {
        if (!instanceOfNodeError(error) || error.code !== 'ENOENT') throw error;
      }

      // start procesing zip...
      const tempZipPath = path.join(UPLOADS_DIR, `temp-${Date.now()}.zip`);

      await pipeline(file.file, createWriteStream(tempZipPath));
      await extract(tempZipPath, {
        dir: path.resolve(PTR_SESSION_DIR),
      });

      await unlink(tempZipPath);

      return reply.send({
        status: true,
        message: 'Success!',
        extractedFiles: await readdir(PTR_SESSION_DIR),
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
  });
};

export default uploadSessionRoute;
