import { useEffect, useState } from 'react';
import { useStatus } from '../../hooks/useStatus';
import { useGroups } from '../../api/hooks/useGroups';
import { Group } from '../../types';
import GroupTable from '../../components/GroupTable';
import { useCreatePosts } from '../../api/hooks/usePosts';
import toast from 'react-hot-toast';

const CreatePostTab = () => {
  const groupsQuery = useGroups();
  const createPostsMtt = useCreatePosts();

  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);

  const [message, setMessage] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [clearCheck, setClearCheck] = useState(true);
  const status = useStatus(false);

  useEffect(() => {
    if (status.success) toast.success(status.success);
  }, [status.success]);

  useEffect(() => {
    if (status.error) toast.error(status.error);
  }, [status.error]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    status.set('LOADING');

    try {
      const response = await createPostsMtt.mutateAsync({
        groupIds: selectedGroups.map((g) => g.groupId),
        message,
        description,
        files,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      status.set('SUCCESS', `Post creation task started: ${response.taskId}`);

      // Reset form
      setMessage('');
      setTags('');
      setDescription('');
      setFiles([]);
    } catch (err) {
      status.set('ERROR', err instanceof Error ? err : 'Unknown error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
      <div role="form">
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

        <div className="mb-4">
          <GroupTable
            data={groupsQuery.data || []}
            onSelectionChange={setSelectedGroups}
          />
        </div>

        <label htmlFor="clear-checkbox" className='flex p-6 my-6 cursor-pointer'>
          <input
            id="clear-checkbox"
            type="checkbox"
            
            checked={clearCheck}
            onChange={(e) => setClearCheck(e.target.checked)}
          />
          Clear inputs before submit
        </label>

        <button
          type="submit"
          onClick={handleCreatePost}
          disabled={status.loading || !selectedGroups.length || !message.length}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {status.loading ? 'Creating...' : 'Create Post'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostTab;
