import { FastifyPluginAsync } from "fastify";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * El autoload original está roto :(
 */
export const autoload: FastifyPluginAsync<{
  dir: string, 
  forceESM: boolean,
  options?: {
    prefix?: string
  }
}> = async (app, opts) => {
  const registerRecursive = async (dirPath: string) => {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        // Recursively search subdirectories
        await registerRecursive(fullPath);
      } else if (stats.isFile() && item.endsWith('.ts')) {
        // Add .ts files
        const relative = dirPath.replace(opts.dir, '').replace(/\.ts$/, '');
        const importE = (await import(fullPath)) as {
          default?: FastifyPluginAsync;
        };
        if (!importE.default) continue;
        await app.register(importE.default, {
          prefix: opts.options?.prefix ? path.join(opts.options.prefix, relative) : undefined,
        });
      }
    }
  };

  await registerRecursive(opts.dir);
}