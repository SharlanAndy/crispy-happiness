import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge';

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
    <div className={`bg-card rounded-xl border border-[#E5E5E5] shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold px-5 pt-4">{title}</h2>
      <div className={`grid ${columnClasses[columns]} gap-y-4 gap-x-10 px-5 py-4`}>
        {items.map((item, idx) => (
          <div className="flex flex-col gap-2" key={idx}>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            {item.badge ? (
              <StatusBadge status={item.value} small={false} />
            ) : (
              <div className="flex px-3 py-2 bg-[#F3F3F5] rounded-md">
                <p className={`font-medium text-md`}>
                  {item.value || '-'}
                </p>
              </div>
            )}
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
      badge: PropTypes.bool
    })
  ).isRequired,
  columns: PropTypes.oneOf([1, 2, 3, 4]),
  className: PropTypes.string,
};
