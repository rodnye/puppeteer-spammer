import { useState, useEffect, useMemo } from 'react';
import { Group } from '../types';
import Table, { arrIncludeFilterFn } from '../components/Table';
import { makeGroupUrl } from '../utils/url';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import Tag from './Tag';

const groupColumns: ColumnDef<Group>[] = [
  {
    // hide this field
    accessorKey: 'groupId',
    header: '',
    cell: '',
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <a
        className="underline text-blue-500"
        target="_blank"
        rel="noopener noreferrer"
        href={makeGroupUrl(row.getValue('groupId'))}
      >
        {row.getValue('name')}
      </a>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    filterFn: arrIncludeFilterFn,
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'postIds',
    header: 'Posts',
    cell: ({ row }) => {
      const postIds = row.getValue('postIds') as string[];
      return postIds.length;
    },
  },
];

interface GroupTableProps {
  data: Group[];
  onSelectionChange?: (selectedGroups: Group[]) => void;
  initialGlobalFilter?: string;
}

const GroupTable = ({
  data,
  onSelectionChange,
  initialGlobalFilter = '',
}: GroupTableProps) => {
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
  const [rowSelection, setRowSelection] = useState({});

  const selectedGroups = useMemo(() => {
    const selectedGroups: Group[] = [];
    for (const index of Object.keys(rowSelection)) {
      selectedGroups.push(data[Number(index)]);
    }
    return selectedGroups;
  }, [rowSelection, data]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedGroups);
    }
  }, [selectedGroups, onSelectionChange]);

  const table = useReactTable({
    data,
    columns: groupColumns,
    state: {
      globalFilter,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  return (
    <Table
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  );
};

export default GroupTable;
