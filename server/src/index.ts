import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import multipart, { ajvFilePlugin } from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';

import pkg from '../package.json';
import { logger } from '@/services/core/logger';
import {
  UPLOADS_DIR,
  PORT,
  ROOT_DIR,
  SERVER_URL,
} from '@/services/core/config';
import { schemas } from './routes/schemas/schemas';

const app = Fastify({
  loggerInstance: logger,
  ajv: {
    plugins: [ajvFilePlugin],
  },
});

app.register(multipart, {
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
});

app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

app.register(swagger, {
  openapi: {
    info: {
      title: pkg.name,
      description: 'Documentación de la API',
      version: pkg.version,
    },
    servers: [{ url: SERVER_URL }],
  },
});

app.register(swaggerUI, {
  routePrefix: '/docs',
});

for (const [name, schema] of Object.entries(schemas)) {
  app.addSchema({ $id: name, ...schema });
}

app.register(autoload, {
  dir: join(ROOT_DIR, 'src/routes/api'),
  forceESM: true,
  options: { prefix: '/api' },
});

app.register(fastifyStatic, {
  root: join(ROOT_DIR, 'public/dist'),
  prefix: '/',
  index: 'index.html',
  list: false,
  redirect: false,
  decorateReply: true,
});

app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api') || request.url.startsWith('/docs')) {
    return reply.status(404).send({ error: 'Not Found' });
  }

  return reply.sendFile('index.html');
});

const start = async () => {
  try {
    await app.ready();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info('Swagger docs: ' + SERVER_URL + '/docs');

    if (!existsSync(UPLOADS_DIR)) await mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
