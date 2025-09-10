import { useState } from 'react';
import CreatePostTab from './CreatePostTab';
import DeletePostTab from './DeletePostTab';
import { useGroups } from '../../api/hooks/useGroups';

const PostManagement = () => {
  const { isLoading } = useGroups();
  const [activeTab, setActiveTab] = useState<'create' | 'delete'>('create');

  if (isLoading) return <div>Loading groups...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Post Management</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Post
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'delete'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Delete Posts
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'create' ? <CreatePostTab /> : <DeletePostTab />}
    </div>
  );
};

export default PostManagement;
