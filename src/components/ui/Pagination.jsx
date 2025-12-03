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
  if (totalPages <= 1) return null;

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

  return (
    <div className="p-4 border-t flex justify-end">
      <div className="flex items-center h-[40px]">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border border-neutral-200 flex items-center justify-center h-full w-[80px] rounded-tl-[5px] rounded-bl-[5px] text-[16px] text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`border border-neutral-200 border-l-0 flex items-center justify-center h-full w-[45px] text-[16px] transition-colors ${
              page === currentPage
                ? 'bg-black text-white'
                : 'text-black hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border border-neutral-200 border-l-0 flex items-center justify-center h-full w-[86px] rounded-tr-[5px] rounded-br-[5px] text-[16px] text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
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
