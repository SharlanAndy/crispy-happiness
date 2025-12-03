/**
 * Pagination utilities for data tables
 */

/**
 * Filter data based on search term
 * @param {Array} data - Array of items to filter
 * @param {string} searchTerm - Search term to filter by
 * @param {Array<string>} searchKeys - Keys to search in each item
 * @returns {Array} Filtered data
 */
export function filterData(data, searchTerm, searchKeys) {
  if (!searchTerm) return data;
  
  const searchLower = searchTerm.toLowerCase();
  return data.filter(item => 
    searchKeys.some(key => 
      String(item[key]).toLowerCase().includes(searchLower)
    )
  );
}

/**
 * Paginate data array
 * @param {Array} data - Array of items to paginate
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Paginated data and metadata
 */
export function paginateData(data, currentPage, itemsPerPage) {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    totalPages,
    startIndex,
    endIndex,
    totalItems: data.length,
  };
}

/**
 * Combined filter and paginate function
 * @param {Array} data - Array of items
 * @param {string} searchTerm - Search term
 * @param {Array<string>} searchKeys - Keys to search
 * @param {number} currentPage - Current page
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Filtered and paginated results
 */
export function filterAndPaginate(data, searchTerm, searchKeys, currentPage, itemsPerPage) {
  const filtered = filterData(data, searchTerm, searchKeys);
  return paginateData(filtered, currentPage, itemsPerPage);
}
