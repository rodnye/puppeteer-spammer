import { createWriteStream } from 'fs';
import { pipeline } from 'node:stream/promises';
import https from 'node:https';

export const downloadFile = async (url: string, destPath: string) => {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download file, status code: ${response.statusCode}`
            )
          );
          return;
        }
        pipeline(response, file)
          .then(resolve)
          .catch(reject);
      })
      .on('error', reject);
  });
};
