import React from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';

/**
 * SearchBar - Reusable search input component
 * 
 * @param {Object} props
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Controlled input value
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onSearch] - Search handler (called on Enter)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function SearchBar({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  className = ''
}) {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className={`flex gap-3 items-center ${className}`}>
      <Search className="shrink-0 text-[#1C1B1F]" size={24} />
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="bg-[#f3f3f5] rounded-md p-3 text-sm text-[#1C1B1F] placeholder:text-[#868e8d] w-full focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  className: PropTypes.string,
};
