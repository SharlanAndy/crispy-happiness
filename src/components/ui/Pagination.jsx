import PropTypes from 'prop-types';

/**
 * Pagination - Reusable pagination controls
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change handler
 * @param {number} [props.maxVisible] - Max page buttons to show (default: 5)
 */
export default function Pagination({ currentPage, totalPages, onPageChange, maxVisible = 5 }) {
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const hasMultiplePages = totalPages > 1;
  const pageNumbers = getPageNumbers();
  
  // Ensure currentPage is within valid range
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const isFirstPage = safeCurrentPage <= 1;
  const isLastPage = safeCurrentPage >= totalPages;

  return (
    <div className="p-4 border-t flex justify-end">
      <div className="flex items-center h-[40px]">
        {hasMultiplePages && (
          <button
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={isFirstPage}
            className="border border-neutral-200 flex items-center justify-center h-full w-[80px] rounded-tl-[5px] rounded-bl-[5px] text-[16px] text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
        )}

        {pageNumbers.map((page, index) => {
          // Determine border and rounding classes
          let borderClasses = 'border border-neutral-200';
          let roundedClasses = '';
          
          if (!hasMultiplePages) {
            // Single page: all rounded corners, all borders
            roundedClasses = 'rounded-tl-[5px] rounded-bl-[5px] rounded-tr-[5px] rounded-br-[5px]';
          } else {
            // Multiple pages: remove left border to connect with Previous button or previous page number
            borderClasses += ' border-l-0';
          }
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${borderClasses} ${roundedClasses} flex items-center justify-center h-full w-[45px] text-[16px] transition-colors ${
                page === safeCurrentPage
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        {hasMultiplePages && (
          <button
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={isLastPage}
            className="border border-neutral-200 border-l-0 flex items-center justify-center h-full w-[86px] rounded-tr-[5px] rounded-br-[5px] text-[16px] text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
};
