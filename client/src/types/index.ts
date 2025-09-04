export interface QueueTask {
  id: string;
  type: 'POST_CREATE' | 'POST_DELETE' | 'GROUP_CREATE' | 'GROUP_DELETE';
  data: object;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  priority: number;
  result?: object;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  groupId: string;
  name: string;
  tags: string[];
  postIds: string[];
}

export interface Comment {
  simpleDate: string;
  author: string;
  authorUrl: string;
  comment: string;
  commentUrl: string;
}

export interface TasksResponse {
  status: boolean;
  queue: {
    pending: {
      count: number;
      pairs: [string, string][];
    };
    processing: {
      count: number;
      pairs: [string, string][];
    };
    completed: {
      count: number;
      pairs: [string, string][];
    };
  };
}

export interface TaskResponse {
  status: boolean;
  task: QueueTask;
}

export interface CommentsResponse {
  success: boolean;
  comments: Comment[];
  count: number;
  postUrl: string;
  message: string;
}

export interface GroupsResponse {
  success: boolean;
  message: string;
  count: number;
  filteredBy?: string;
  groups: Group[];
}

export interface TaskIdResponse {
  success: boolean;
  taskId: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}
