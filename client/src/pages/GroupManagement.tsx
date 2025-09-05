import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Group } from '../types';
import Table, { TableColumn } from '../components/Table';
import { extractGroupId } from '../services/parser';

const GroupManagement = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [tagFilter, setTagFilter] = useState('');
  const [newIdField, setNewIdField] = useState('');
  const [newId, setNewId] = useState('');
  const [newTagsField, setNewTagsField] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (tagFilter) {
      const filtered = groups.filter((group) =>
        group.tags.some((tag) =>
          tag.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  }, [groups, tagFilter]);

  useEffect(() => {
    setNewId(extractGroupId(newIdField) || '');
  }, [newIdField]);

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data.groups);
      setFilteredGroups(data.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId) {
      alert('El group id proporcionado no es válido');
      return;
    }
    try {
      const tags = newTagsField
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      await api.createGroup(newIdField, tags);
      setSuccess(`Group creation task started for ${newIdField}`);
      setNewIdField('');
      setNewTagsField('');
      fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDeleteGroups = async () => {
    if (selectedGroups.length === 0) {
      setError('Please select groups to delete');
      return;
    }
    try {
      await api.deleteGroups(selectedGroups.map((g) => g.groupId));
      setSuccess(`Deletion task started for ${selectedGroups.length} groups`);
      setSelectedGroups([]);
      fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const groupColumns: TableColumn<Group>[] = [
    {
      key: 'groupId',
      label: 'Group ID',
      render: (value) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'postIds',
      label: 'Posts',
      render: (value: string[]) => value.length,
    },
  ];

  if (loading) return <div className="text-center py-8">Loading groups...</div>;

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
                className={
                  'shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline' +
                  ' ' +
                  (newId
                    ? 'text-green-400'
                    : !newIdField
                    ? 'text-gray-700'
                    : 'text-red-600')
                }
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
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="tagFilter"
            >
              Filter by Tag
            </label>
            <input
              id="tagFilter"
              type="text"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter tag to filter"
            />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">
        Groups ({filteredGroups.length})
      </h2>

      <Table
        data={filteredGroups}
        columns={groupColumns}
        selectable={true}
        idField="groupId"
        selectedItems={selectedGroups}
        onSelectionChange={setSelectedGroups}
        loading={loading}
        emptyMessage="No groups found"
      />
    </div>
  );
};

export default GroupManagement;
