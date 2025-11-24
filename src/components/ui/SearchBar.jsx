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
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
