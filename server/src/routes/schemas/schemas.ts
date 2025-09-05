export const schemas = {
  QueueTask: {
    id: 'QueueTask',
    type: 'object',
    properties: {
      id: { type: 'string' },
      type: {
        type: 'string',
        enum: ['POST_CREATE', 'POST_DELETE', 'GROUP_CREATE', 'GROUP_DELETE'],
      },
      data: { type: 'object' },
      status: {
        type: 'string',
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      },
      priority: {
        type: 'number',
        minimum: 1,
        maximum: 3,
      },
      result: { type: 'object' },
      error: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    required: [
      'id',
      'type',
      'data',
      'status',
      'priority',
      'createdAt',
      'updatedAt',
    ],
  },
  Group: {
    id: 'Group',
    type: 'object',
    properties: {
      groupId: { type: 'string' },
      name: { type: 'string' },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      postIds: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['id', 'name', 'tags', 'postIds'],
  },
};
