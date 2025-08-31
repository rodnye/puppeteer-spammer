import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import pkg from '../package.json';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import multipart from '@fastify/multipart';

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

app.register(multipart, {
  attachFieldsToBody: 'keyValues',
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
    servers: [{ url: 'http://localhost:3000' }],
  },
});

app.register(swaggerUI, {
  routePrefix: '/docs',
});

// Rutas base (legacy)
app.register(autoload, {
  dir: join(__dirname, 'routes'),
  options: { prefix: '/' },
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    app.log.info('Swagger docs en http://localhost:3000/docs');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
