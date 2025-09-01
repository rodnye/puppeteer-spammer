import { FastifyPluginAsync } from 'fastify';

const pingRoute: FastifyPluginAsync = async (app) => {
  app.get('/ping', async () => {
    return 'pong!';
  });
};

export default pingRoute;
