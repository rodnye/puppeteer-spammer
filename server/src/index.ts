import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import pkg from '../package.json';
import { join } from 'path';
import multipart, { ajvFilePlugin } from '@fastify/multipart';
import { logger } from '@/services/core/logger';
import { existsSync } from 'fs';
import {
  UPLOADS_DIR,
  PORT,
  ROOT_DIR,
  SERVER_URL,
} from '@/services/core/config';
import { mkdir } from 'fs/promises';
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
