import { remove, ensureDir, copy } from 'fs-extra';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCE_DIR = join(__dirname, '../client/dist');
const TARGET_DIR = join(__dirname, '../server/public/dist');

const copyClientDist = async () => {
  try {
    if (!existsSync(SOURCE_DIR))
      throw new Error(`The source directory does not exist: ${SOURCE_DIR}`);

    if (existsSync(TARGET_DIR)) {
      console.log('Cleaning target directory...');
      await remove(TARGET_DIR);
    }

    await ensureDir(dirname(TARGET_DIR));

    console.log(`Copying files from ${SOURCE_DIR} to ${TARGET_DIR}...`);
    await copy(SOURCE_DIR, TARGET_DIR);

    console.log('✅ Copy completed successfully');
  } catch (error) {
    console.error('❌ Error copying files:', error.message);
    process.exit(1);
  }
};

copyClientDist();
