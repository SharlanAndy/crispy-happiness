import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * SelectWithIcon - Reusable select dropdown with icon and arrow
 * 
 * @param {Object} props
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Options array [{value, label}]
 * @param {React.ReactNode} [props.icon] - Optional icon to display
 * @param {string} [props.className] - Additional CSS classes
 */
export default function SelectWithIcon({ value, onChange, options, icon, className = '' }) {
  return (
    <div className={`flex gap-3 items-center ${className}`}>
      {icon && <div className="shrink-0 text-[#1C1B1F]">{icon}</div>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="flex items-center gap-2 bg-[#f3f3f5] rounded-md p-3 text-sm text-[#1C1B1F] placeholder:text-[#868e8d] min-w-[348px] pr-10 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-black"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
        />
      </div>
    </div>
  );
}

SelectWithIcon.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  icon: PropTypes.node,
  className: PropTypes.string,
};
