import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ 
  currentPage, 
  lastPage, 
  total, 
  from, 
  to, 
  onPageChange,
  disabled = false
}) => {
  if (!total || total === 0) return null;

  return (
    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-gray-500">
        Mostrando <span className="font-medium text-gray-700">{from}</span> a {' '}
        <span className="font-medium text-gray-700">{to}</span> de {' '}
        <span className="font-medium text-gray-700">{total}</span> resultados
      </p>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className="h-8 py-0 px-2"
        >
          <ChevronLeft size={16} />
          <span className="sr-only sm:not-sr-only sm:ml-1">Anterior</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
            // Simple pagination logic to show current window
            let pageNum;
            if (lastPage <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= lastPage - 2) {
              pageNum = lastPage - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={i}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === pageNum 
                  ? 'bg-unich-purple text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
                disabled={disabled}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage || disabled}
          className="h-8 py-0 px-2"
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Siguiente</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
