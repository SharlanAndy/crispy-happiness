import React from 'react';
import PropTypes from 'prop-types';

/**
 * ActionButton - Reusable icon button for table actions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component (from lucide-react)
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.variant] - Color variant: 'default' | 'danger' | 'success'
 * @param {string} [props.tooltip] - Tooltip text
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ActionButton({ icon, onClick, variant = 'default', tooltip, className = '' }) {
  const variantClasses = {
    default: 'text-muted-foreground hover:text-primary hover:bg-secondary',
    danger: 'text-red-600 hover:bg-red-100',
    success: 'text-green-600 hover:bg-green-100',
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-1.5 border border-[#E5E5E5] rounded-md transition-colors ${variantClasses[variant]} ${className}`}
    >
      {icon}
    </button>
  );
}

ActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'danger', 'success']),
  tooltip: PropTypes.string,
  className: PropTypes.string,
};
