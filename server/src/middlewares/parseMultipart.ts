import { UPLOADS_DIR } from '@/services/core/config';
import { randomUUID } from 'crypto';
import { FastifyReply, FastifyRequest, FastifySchema } from 'fastify';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

/**
 * Fastify's built-in multipart parser didn't quite meet my needs,
 * This custom middleware that transforms multipart data
 * into properly typed objects based on your schema definition.
 *
 * Use this in preHandler hook
 *
 * @author Rodny Estrada
 */
export const parseMultipartMiddleware =
  <T extends Record<string, any>>(schema: FastifySchema) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    type K = string & keyof T;

    try {
      const body: Partial<T> = {};
      const bodySchema = schema.body as any;

      reply.log.debug('Transforming multipart data into structured format');

      for await (const part of request.parts()) {
        const name = part.fieldname as K;
        const prop = bodySchema.properties?.[name];

        if (!prop) {
          throw new Error(`Field '${name}' is not defined in the schema`);
        }

        if (part.type === 'field') {
          // handle standard form fields
          if (prop.type === 'string') {
            body[name] = part.value as T[K];
          } else if (prop.type === 'number') {
            body[name] = parseFloat(part.value as string) as T[K];
          } else if (prop.type === 'array') {
            const type = prop.items?.type;
            if (type === 'string' || type === 'number') {
              body[name] = JSON.parse(part.value as string);
            } else {
              throw new Error(
                `Unsupported array item type '${type}' for field '${name}'`
              );
            }
          }
        } else if (part.type === 'file') {
          // handle file uploads
          const saveUpload = async () => {
            const filename = `${randomUUID().slice(0, 9)}_${part.filename}`;
            const filePath = path.join(UPLOADS_DIR, filename);
            reply.log.debug(`Saving uploaded file: ${filePath}`);
            await pipeline(part.file, createWriteStream(filePath));
            return filePath;
          };

          if (prop.type === 'array') {
            if (prop.items?.format === 'binary') {
              if (!body[name]) body[name] = [] as T[K];
              (body[name] as unknown[]).push(await saveUpload());
            } else {
              throw new Error(`Unexpected file array for field '${name}'`);
            }
          } else if (prop.isFile === true) {
            if (!body[name]) {
              body[name] = (await saveUpload()) as T[K];
            } else {
              throw new Error(`Only one file allowed for field '${name}'`);
            }
          } else {
            throw new Error(`Unexpected file upload for field '${name}'`);
          }
        }
      }

      // validate required fields
      for (const field of bodySchema.required || []) {
        if (!body[field as K]) {
          throw new Error(`Required field '${field}' was not provided`);
        }
      }

      reply.log.debug('Multipart parsing completed successfully');
      reply.log.debug(JSON.stringify(body, null, 2));

      request.body = body as T;
    } catch (error) {
      reply.log.error(error);
      if (error instanceof Error) {
        return reply.status(400).send({
          error: error.message,
        });
      }
      return reply.status(500).send({ message: 'Internal server error' });
    }
  };
