import { useState } from 'react';
import { api } from '../services/api';

const PostManagement = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'delete'>('create');
  const [groupIds, setGroupIds] = useState('');
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [postsToDelete, setPostsToDelete] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      const groupIdArray = groupIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      formData.append('groupIds', JSON.stringify(groupIdArray));
      formData.append('message', message);

      if (tags) {
        const tagArray = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        formData.append('tags', JSON.stringify(tagArray));
      }

      if (description) {
        formData.append('desc', description);
      }

      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.createPost(formData);
      setSuccess(`Post creation task started: ${response.taskId}`);

      // Reset form
      setGroupIds('');
      setMessage('');
      setTags('');
      setDescription('');
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosts = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const posts = postsToDelete
        .split('\n')
        .map((line) => {
          const [groupId, postId] = line.split(',').map((item) => item.trim());
          return { groupId, postId };
        })
        .filter((post) => post.groupId && post.postId);

      if (posts.length === 0) {
        setError('Please enter valid post data');
        return;
      }

      const response = await api.deletePosts(posts);
      setSuccess(`Post deletion task started: ${response.taskId}`);
      setPostsToDelete('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Post Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

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

      {activeTab === 'create' ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
          <form onSubmit={handleCreatePost}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="groupIds"
              >
                Group IDs (comma separated)
              </label>
              <input
                id="groupIds"
                type="text"
                value={groupIds}
                onChange={(e) => setGroupIds(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., 123456789, 987654321"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                placeholder="Enter your post content here..."
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="tags"
              >
                Tags (comma separated, optional)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., promotion, announcement"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description (optional)
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Internal description for this post"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="files"
              >
                Attachments (images/videos)
              </label>
              <input
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected files:</p>
                  <ul className="list-disc pl-5">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Delete Posts</h2>
          <form onSubmit={handleDeletePosts}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="postsToDelete"
              >
                Posts to Delete (one per line: groupId,postId)
              </label>
              <textarea
                id="postsToDelete"
                value={postsToDelete}
                onChange={(e) => setPostsToDelete(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
                placeholder="123456789,987654321&#10;987654321,123456789"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: Group ID, Post ID (one pair per line)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Posts'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostManagement;
