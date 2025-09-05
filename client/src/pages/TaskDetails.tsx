import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { api } from '../services/api';
import { QueueTask } from '../types';

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<QueueTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;

      try {
        const data = await api.getTask(taskId);
        setTask(data.task);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (loading)
    return <div className="text-center py-8">Loading task details...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  if (!task) return <div className="text-center py-8">Task not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Task Details</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Task Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-mono">{task.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p>{task.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : task.status === 'PROCESSING'
                      ? 'bg-blue-100 text-blue-800'
                      : task.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <p>{task.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p>{new Date(task.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p>{new Date(task.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Task Data
            </h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(task.data, null, 2)}
            </pre>

            {task.error && (
              <div className="mt-4">
                <h3 className="text-md font-semibold text-red-700 mb-2">
                  Error
                </h3>
                <p className="text-red-600 bg-red-50 p-3 rounded">
                  {task.error}
                </p>
              </div>
            )}

            {task.result && (
              <div className="mt-4">
                <h3 className="text-md font-semibold text-green-700 mb-2">
                  Result
                </h3>
                <pre className="bg-green-50 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(task.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
