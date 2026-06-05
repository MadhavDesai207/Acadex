import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const Table = ({
  headers = [],
  data = [],
  loading = false,
  actions = null,
  emptyMessage = 'No records found.',
  pagination = null, // { currentPage, totalPages, onPageChange, limit, onLimitChange }
  onSort = null // (key, direction)
}) => {
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // asc or desc

  const handleSortClick = (key) => {
    if (!onSort) return;
    
    let nextDirection = 'asc';
    if (sortKey === key) {
      nextDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    setSortKey(key);
    setSortDirection(nextDirection);
    onSort(key, nextDirection);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full overflow-x-auto rounded-xl border border-slate-700/50 glass-panel">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/30 text-slate-400 font-semibold">
              {headers.map((header) => (
                <th 
                  key={header.key} 
                  className={`py-3.5 px-4 select-none ${header.sortable && onSort ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                  onClick={() => header.sortable && handleSortClick(header.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{header.label}</span>
                    {header.sortable && onSort && (
                      <div className="flex flex-col text-slate-500">
                        <ChevronUp 
                          size={12} 
                          className={`-mb-1 ${sortKey === header.key && sortDirection === 'asc' ? 'text-brand-light' : ''}`} 
                        />
                        <ChevronDown 
                          size={12} 
                          className={`${sortKey === header.key && sortDirection === 'desc' ? 'text-brand-light' : ''}`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              // Skeleton Loader Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {headers.map((_, hIdx) => (
                    <td key={hIdx} className="py-4 px-4">
                      <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                    </td>
                  ))}
                  {actions && (
                    <td className="py-4 px-4 text-right">
                      <div className="h-4 bg-slate-700/50 rounded w-10 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row
              <tr>
                <td 
                  colSpan={headers.length + (actions ? 1 : 0)} 
                  className="py-10 text-center text-slate-500 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className="hover:bg-slate-800/20 active:bg-slate-800/40 transition-colors duration-150"
                >
                  {headers.map((header) => (
                    <td key={header.key} className="py-3.5 px-4 font-medium text-slate-300">
                      {header.render ? header.render(row) : row[header.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="py-3.5 px-4 text-right font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && !loading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show</span>
            <select
              value={pagination.limit || 10}
              onChange={(e) => pagination.onLimitChange && pagination.onLimitChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-300 focus:outline-none focus:border-brand"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1.5 text-xs">
              {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      pagination.currentPage === pageNum
                        ? 'bg-brand text-white'
                        : 'border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
