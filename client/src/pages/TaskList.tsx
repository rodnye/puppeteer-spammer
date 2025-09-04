import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TasksResponse } from '../types';
import { Link } from 'wouter';

const TaskList = () => {
  const [tasks, setTasks] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleClearQueue = async () => {
    if (window.confirm('Are you sure you want to clear all tasks?')) {
      try {
        await api.deleteTasks();
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading tasks...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  const allTasks = [
    ...(tasks?.queue.pending.pairs.map(([type, id]) => ({
      id,
      type,
      status: 'PENDING',
    })) || []),
    ...(tasks?.queue.processing.pairs.map(([type, id]) => ({
      id,
      type,
      status: 'PROCESSING',
    })) || []),
    ...(tasks?.queue.completed.pairs.map(([type, id]) => ({
      id,
      type,
      status: 'COMPLETED',
    })) || []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Queue</h1>
        <button
          onClick={handleClearQueue}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Clear Queue
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allTasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  {task.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {task.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : task.status === 'PROCESSING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
