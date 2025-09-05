import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TasksResponse } from '../types';
import { Link } from 'wouter';

const Dashboard = () => {
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

  if (loading)
    return <div className="text-center py-8">Loading dashboard...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Pending Tasks
          </h2>
          <p className="text-3xl font-bold text-yellow-500">
            {tasks?.queue.pending.count || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Processing Tasks
          </h2>
          <p className="text-3xl font-bold text-blue-500">
            {tasks?.queue.processing.count || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Completed Tasks
          </h2>
          <p className="text-3xl font-bold text-green-500">
            {tasks?.queue.completed.count || 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Tasks
        </h2>
        <div className="space-y-3">
          {tasks?.queue.pending.pairs.slice(0, 5).map(([id, type]) => (
            <div
              key={id}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="font-mono text-sm">{id}</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                {type}
              </span>
              <Link
                to={`/tasks/${id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
