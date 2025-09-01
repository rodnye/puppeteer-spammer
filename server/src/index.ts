import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({
  logger: {
    level: 'debug',
    transport: {
      target: '@fastify/one-line-logger',
    },
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
      title: 'API Base',
      description: 'Documentación de la API base con Fastify y Swagger',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
});

app.register(swaggerUI, {
  routePrefix: '/docs',
});

app.register(fastifyMultipart, {
  attachFieldsToBody: 'keyValues',
  onFile: async (part: any) => {
    part.value = {
      filename: part.filename,
      mimetype: part.mimetype,
      encoding: part.encoding,
      value: await part.toBuffer(),
    };
  },
});

// Rutas base (legacy)
app.register(autoload, {
  dir: join(__dirname, 'routes'),
  options: { prefix: '/' },
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor iniciado en http://localhost:3000');
    console.log('Swagger docs en http://localhost:3000/docs');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
