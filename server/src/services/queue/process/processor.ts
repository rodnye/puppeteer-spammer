import { logger } from '../logger';
import { QueueTask } from '../types';
import { processPostCreate } from './posts/create';
import { processPostDelete } from './posts/delete';
import { processGroupCreate } from './groups/create';
import { processGroupDelete } from './groups/delete';

export async function processTask<T extends QueueTask>(
  task: T
): Promise<T['result']> {
  logger.info(`Processing task: ${task.type}`);

  switch (task.type) {
    case 'GROUP_CREATE':
      return await processGroupCreate(task.data);
    case 'GROUP_DELETE':
      return await processGroupDelete(task.data);
    case 'POST_CREATE':
      return await processPostCreate(task.data);
    case 'POST_DELETE':
      return await processPostDelete(task.data);
    default:
      throw new Error(`Unknown task type: ${task['type']}`);
  }
}
