import { useState, useEffect } from 'react';
import { Group } from '../types';
import { extractGroupId } from '../utils/url';
import {
  useCreateGroup,
  useDeleteGroups,
  useGroups,
} from '../api/hooks/useGroups';
import GroupTable from '../components/GroupTable';


const GroupManagement = () => {
  const groupsQuery = useGroups();
  const createGroupMtt = useCreateGroup();
  const deleteGroupsMtt = useDeleteGroups();

  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [newId, setNewId] = useState('');
  const [newIdField, setNewIdField] = useState('');
  const [newTagsField, setNewTagsField] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (groupsQuery.error) setError(groupsQuery.error.message);
    else setError(null);
  }, [groupsQuery.error]);

  useEffect(() => {
    setNewId(extractGroupId(newIdField) || '');
  }, [newIdField]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId) {
      alert('El group id proporcionado no es válido');
      return;
    }
    const tags = newTagsField
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    createGroupMtt.mutate({ groupId: newIdField, tags });
    setSuccess(`Group creation task started for ${newIdField}`);
    setNewIdField('');
    setNewTagsField('');
  };

  const handleDeleteGroups = async () => {
    if (selectedGroups.length === 0) {
      alert('Please select groups to delete');
      return;
    }
    deleteGroupsMtt.mutate(selectedGroups.map((g) => g.groupId));
    setSuccess(`Deletion task started for ${selectedGroups.length} groups`);
    setSelectedGroups([]);
  };

  if (groupsQuery.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Group Management</h1>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Group</h2>
          <form onSubmit={handleCreateGroup}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="groupId"
              >
                Group ID
              </label>
              <input
                id="groupId"
                type="text"
                value={newIdField}
                onChange={(e) => setNewIdField(e.target.value)}
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                  newId
                    ? 'text-green-400'
                    : !newIdField
                    ? 'text-gray-700'
                    : 'text-red-600'
                }`}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="tags"
              >
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                value={newTagsField}
                onChange={(e) => setNewTagsField(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., sales, marketing, announcements"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Group
            </button>
          </form>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Delete Groups</h2>
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Selected {selectedGroups.length} groups for deletion
            </p>
            <button
              onClick={handleDeleteGroups}
              disabled={selectedGroups.length === 0}
              className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                selectedGroups.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Delete Selected Groups
            </button>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4">
        Groups ({groupsQuery.data?.length || 0})
      </h2>

      <GroupTable
        data={groupsQuery.data || []}
        onSelectionChange={setSelectedGroups}
      />
    </div>
  );
};

export default GroupManagement;
