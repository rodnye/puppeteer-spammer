import { useState } from 'react';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectable?: boolean;
  idField: keyof T;
  selectedItems?: T[];
  onSelectionChange?: (selected: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function Table<T>({
  data,
  columns,
  selectable = false,
  idField,
  selectedItems = [],
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<T[]>(selectedItems);

  const handleSelectionChange = (items: T[]) => {
    setInternalSelected(items);
    if (onSelectionChange) {
      onSelectionChange(items);
    }
  };

  const toggleItemSelection = (item: T) => {
    const isSelected = internalSelected.some(
      (selected) => selected[idField] === item[idField]
    );

    if (isSelected) {
      handleSelectionChange(
        internalSelected.filter(
          (selected) => selected[idField] !== item[idField]
        )
      );
    } else {
      handleSelectionChange([...internalSelected, item]);
    }
  };

  const toggleSelectAll = () => {
    if (internalSelected.length === data.length) {
      handleSelectionChange([]);
    } else {
      handleSelectionChange([...data]);
    }
  };

  const allSelected =
    data.length > 0 && internalSelected.length === data.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                  {column.sortable && (
                    <button className="ml-1 text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={String(item[idField])} className="hover:bg-gray-50">
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={internalSelected.some(
                          (selected) => selected[idField] === item[idField]
                        )}
                        onChange={() => toggleItemSelection(item)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={`${String(item[idField])}-${String(column.key)}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
