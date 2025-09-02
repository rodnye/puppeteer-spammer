import { FastifyPluginAsync } from 'fastify';

const pingRoute: FastifyPluginAsync = async (app) => {
  app.get('/ping', async (_, reply) => {
    return reply.send({ message: 'pong!' });
  });
};

export default pingRoute;
