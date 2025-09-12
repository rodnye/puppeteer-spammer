import type { ProcessEventMap, QueueTask } from './types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/services/core/logger';
import { processTask } from './process/processor';
import EventEmitter from 'events';
import { closeBrowser } from '../core/browser';

export class QueueManager extends EventEmitter<ProcessEventMap> {
  private pendingTasks: QueueTask[] = [];
  private processingTasks: Map<string, QueueTask> = new Map();
  private completedTasks: Map<string, QueueTask> = new Map();
  private isProcessing = false;

  private inactiveTimeout: NodeJS.Timeout | null;

  constructor() {
    super();
  }

  addTask(
    taskData: Omit<
      QueueTask,
      'emitter' | 'id' | 'status' | 'createdAt' | 'updatedAt' | 'priority'
    > & {
      priority?: number;
    }
  ) {
    const task = {
      priority: 0,
      ...taskData,
      id: uuidv4(),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      emitter: new EventEmitter(),
    } as QueueTask;

    this.insertTask(task);
    logger.info(`Task added to queue: ${task.type}`);

    // async processing
    this.startProcessQueue();

    return task.id;
  }

  insertTask(task: QueueTask) {
    let insertIn = this.pendingTasks.length;

    for (let i = 0; i < this.pendingTasks.length; i++) {
      if (task.priority > this.pendingTasks[i].priority) {
        insertIn = i;
        break;
      }
    }

    this.pendingTasks.splice(insertIn, 0, task);
  }

  getTask(taskId: string) {
    return (
      this.pendingTasks.find((t) => t.id === taskId) ||
      this.processingTasks.get(taskId) ||
      this.completedTasks.get(taskId)
    );
  }

  async startProcessQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    if (this.inactiveTimeout) clearTimeout(this.inactiveTimeout);

    while (this.pendingTasks.length > 0) {
      const task = this.pendingTasks.shift()!;

      task.status = 'PROCESSING';
      task.updatedAt = new Date();

      this.processingTasks.set(task.id, task);

      task.emitter.emit('processing', task);
      this.emit('processing', task);

      try {
        const result = await processTask(task);

        task.status = 'COMPLETED';
        task.result = result;
        task.updatedAt = new Date();

        this.processingTasks.delete(task.id);
        this.completedTasks.set(task.id, task);
        task.emitter.emit('completed', task);
        this.emit('completed', task);

        logger.info({ taskId: task.id }, `Task completed: ${task.type}`);
      } catch (error) {
        this.processingTasks.delete(task.id);
        this.completedTasks.set(task.id, task);

        task.status = 'FAILED';

        task.error = error instanceof Error ? error.message : 'Unknown error';
        if (!(error instanceof Error)) logger.error(error);

        task.updatedAt = new Date();
        task.emitter.emit('failed', task);
        this.emit('failed', task);

        logger.error(
          {
            taskId: task.id,
            error: task.error,
          },
          `Task failed: ${task.type}`
        );
      } finally {
        task.emitter.emit('finished', task);
        this.emit('finished', task);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
    this.inactiveTimeout = setTimeout(() => closeBrowser(), 1000 * 60 * 20);
  }

  /**
   * get a task emitter
   */
  task(taskId: string) {
    return this.getTask(taskId)?.emitter;
  }

  async getQueueStatus() {
    return {
      pending: {
        count: this.pendingTasks.length,
        pairs: this.pendingTasks.map((t) => [t.type, t.id]),
      },
      processing: {
        count: this.processingTasks.size,
        pairs: [...this.processingTasks.values()].map((t) => [t.type, t.id]),
      },
      completed: {
        count: this.completedTasks.size,
        pairs: [...this.completedTasks.values()].map((t) => [t.type, t.id]),
      },
    };
  }

  async clearCompletedTasks() {
    this.completedTasks.clear();
  }
}

// only one queue manager ;)
export const queueManager = new QueueManager();
