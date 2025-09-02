import EventEmitter from 'events';
import { GroupCreateData, GroupCreateResult } from './process/groups/create';
import { GroupDeleteData, GroupDeleteResult } from './process/groups/delete';
import { PostCreateData, PostCreateResult } from './process/posts/create';
import { PostDeleteData, PostDeleteResult } from './process/posts/delete';

export interface ProcessEventMap {
  finished: [QueueTask];
  completed: [QueueTask];
  failed: [QueueTask];
  processing: [QueueTask];
}

interface _QueueTaskBase {
  id: string;
  type: string;
  data: any;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  /**
   * recommend a number from 1 to 3
   */
  priority: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  readonly emitter: EventEmitter<ProcessEventMap>;
}

export type QueueTask =
  | PostCreateQT
  | PostDeleteQT
  | GroupCreateQT
  | GroupDeleteQT;

export interface PostCreateQT extends _QueueTaskBase {
  type: 'POST_CREATE';
  data: PostCreateData;
  result?: PostCreateResult;
}

export interface PostDeleteQT extends _QueueTaskBase {
  type: 'POST_DELETE';
  data: PostDeleteData;
  result?: PostDeleteResult;
}

export interface GroupCreateQT extends _QueueTaskBase {
  type: 'GROUP_CREATE';
  data: GroupCreateData;
  result?: GroupCreateResult;
}

export interface GroupDeleteQT extends _QueueTaskBase {
  type: 'GROUP_DELETE';
  data: GroupDeleteData;
  result?: GroupDeleteResult;
}
