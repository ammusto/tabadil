import React from 'react';

interface ReaderPaginationProps {
  realPage:string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const ReaderPagination: React.FC<ReaderPaginationProps> = ({
  currentPage,
  realPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  return (
    <div className={`pagination flex ${className}`}>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        ←
      </button>

      <div className="pagination-center flex items-center">
        <span className="px-4">
          Page {realPage}
        </span>
      </div>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        →
      </button>
    </div>
  );
};

export default ReaderPagination;