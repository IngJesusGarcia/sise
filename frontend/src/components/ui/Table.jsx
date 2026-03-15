import React from 'react';
import { Search } from 'lucide-react';
import Pagination from './Pagination';

const Table = ({ 
  columns, 
  data, 
  onSearch, 
  searchPlaceholder = 'Buscar...',
  actions,
  pagination = null // pagination object from Laravel
}) => {
  // If no data, the array might be results or data.data (if paginated)
  const records = pagination ? (pagination.data || []) : (data || []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Barra superior: Búsqueda y acciones */}
      {(onSearch || actions) && (
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          {onSearch && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-unich-purple focus:border-unich-purple transition-all"
              />
            </div>
          )}
          {actions && (
            <div className="flex w-full sm:w-auto items-center gap-2 justify-end">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Contenedor de tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length > 0 ? (
              records.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <Pagination 
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={pagination.onPageChange}
        />
      )}
      
      {!pagination && records.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500">Mostrando <span className="font-medium text-gray-700">{records.length}</span> resultados</p>
        </div>
      )}
    </div>
  );
};

export default Table;
