import { useState } from 'react';
import { useStatus } from '../../hooks/useStatus';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnDef,
} from '@tanstack/react-table';
import { usePosts } from '../../api/hooks/usePosts';
import Table from '../../components/Table';
import { makeGroupUrl, makePostUrl } from '../../utils/url';
import { postsService } from '../../api/services/posts';
import Tag from '../../components/Tag';
import { Post } from '../../types';
import { useGroups } from '../../api/hooks/useGroups';
import toast from 'react-hot-toast';

const columns: ColumnDef<Post>[] = [
  {
    id: 'selection',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  {
    accessorKey: 'postId',
    header: 'Post ID',
    cell({ row }) {
      return (
        <a
          href={makePostUrl(row.original.groupId, row.original.postId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.original.postId}
        </a>
      );
    },
  },
  {
    accessorKey: 'groupId',
    header: 'Group ID',
    cell({ row }) {
      const { data } = useGroups();

      return (
        <a
          href={makeGroupUrl(row.original.groupId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {data
            ? data.find((g) => g.groupId === row.original.groupId)?.name
            : row.original.groupId}
        </a>
      );
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => (
      <div className="max-w-32 flex flex-wrap">
        {row.original.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'desc',
    header: 'Description',
  },
];


export const DeletePostTab = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const postsQuery = usePosts({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  const table = useReactTable({
    data: postsQuery.data?.posts || [],
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    pageCount: postsQuery.data?.pageCount,
    enableRowSelection: true,
  });

  const handleDeletePosts = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error('Please select at least one post to delete');
      return;
    }

    setIsDeleting(true)
    try {
      const postsToDelete = selectedRows.map((row) => ({
        groupId: row.original.groupId,
        postId: row.original.postId,
      }));

      const response = await postsService.deletePosts(postsToDelete);
      toast.success(`Post deletion task started: ${response.taskId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    } finally{
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Delete Posts</h2>

      {/* Tabla de posts */}
      <Table
        table={table}
        globalFilter={globalFilter}
        isLoading={!postsQuery.data}
        setGlobalFilter={setGlobalFilter}
      />

      {/* Botón de eliminar */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDeletePosts}
          disabled={
            isDeleting || table.getSelectedRowModel().rows.length === 0
          }
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isDeleting
            ? 'Deleting...'
            : `Delete Selected (${table.getSelectedRowModel().rows.length})`}
        </button>
      </div>
    </div>
  );
};

export default DeletePostTab;
