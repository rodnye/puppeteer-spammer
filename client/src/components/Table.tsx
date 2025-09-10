import {
  useReactTable,
  flexRender,
  FilterFn,
  RowData,
  Row,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  FaMagnifyingGlass,
  FaCircleCheck,
  FaArrowUp,
  FaArrowDown,
  FaSort,
  FaAnglesLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAnglesRight,
  FaChevronDown,
} from 'react-icons/fa6';

interface TableProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

function Table<TData>({
  table,
  globalFilter,
  setGlobalFilter,
}: TableProps<TData>) {
  const [showColumnFilters, setShowColumnFilters] = useState(false);

  return (
    <div className="space-y-6 p-4 bg-white rounded-xl shadow-lg">
      {/* Barra de búsqueda global */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaMagnifyingGlass className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar en todos los campos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        {/* Contador de filas seleccionadas */}
        {Object.keys(table.getState().rowSelection).length > 0 && (
          <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <FaCircleCheck className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {Object.keys(table.getState().rowSelection).length} fila(s)
              seleccionada(s)
            </span>
          </div>
        )}
      </div>

      {/* Filtros por columna  */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">
            Filtros avanzados
          </h3>
          <button
            onClick={() => setShowColumnFilters(!showColumnFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showColumnFilters ? 'Ocultar' : 'Mostrar'} filtros
            <FaChevronDown
              className={`w-4 h-4 ml-1 transition-transform ${
                showColumnFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
        {showColumnFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {table.getAllLeafColumns().map((column) => {
              if (!column.getCanFilter()) return null;
              return (
                <div key={column.id} className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    {column.id}
                  </label>
                  <input
                    type="text"
                    value={(column.getFilterValue() as string) ?? ''}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    placeholder={`Filtrar ${column.id}`}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabla principal  */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                  />
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-2 cursor-pointer hover:text-gray-700 ${
                          header.column.getCanSort() ? 'select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'asc' ? (
                              <FaArrowUp className="w-4 h-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <FaArrowDown className="w-4 h-4" />
                            ) : (
                              <FaSort className="w-4 h-4 opacity-30" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`transition-colors ${
                  row.getIsSelected() ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td>
                  <div>
                    <input
                      type="checkbox"
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                    />
                  </div>
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Primera</span>
            <FaAnglesLeft className="w-5 h-5 sm:hidden" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Anterior</span>
            <FaAngleLeft className="w-5 h-5 sm:hidden" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <FaAngleRight className="w-5 h-5 sm:hidden" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Última</span>
            <FaAnglesRight className="w-5 h-5 sm:hidden" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-sm text-gray-600 font-medium">
            Página{' '}
            <span className="text-blue-600">
              {table.getState().pagination.pageIndex + 1}
            </span>{' '}
            de <span className="text-blue-600">{table.getPageCount()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Table;

export const arrIncludeFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue
) => {
  return row
    .getValue<string[]>(columnId)
    .some((tag) =>
      tag.toLowerCase().includes(filterValue.toLowerCase().trim())
    );
};
