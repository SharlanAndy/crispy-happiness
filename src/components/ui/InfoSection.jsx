import React from 'react';
import PropTypes from 'prop-types';

/**
 * InfoSection - Reusable information display section
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.items - Info items [{label, value}]
 * @param {number} [props.columns] - Number of columns (1-4)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function InfoSection({ title, items, columns = 2, className = '' }) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`bg-card rounded-xl border shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold border-b p-4">{title}</h2>
      <div className={`grid ${columnClasses[columns]} gap-4 p-4`}>
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
            <p className="font-medium">{item.value || '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

InfoSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
    })
  ).isRequired,
  columns: PropTypes.oneOf([1, 2, 3, 4]),
  className: PropTypes.string,
};
