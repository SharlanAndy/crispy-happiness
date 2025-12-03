import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusBadge - Reusable status indicator
 * 
 * @param {Object} props
 * @param {string} props.status - Status text to display
 * @param {string} [props.variant] - Color variant: 'success' | 'warning' | 'danger' | 'info'
 */
export default function StatusBadge({ status, variant }) {
  // Auto-detect variant from status text if not provided
  const autoVariant = variant || (() => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('success') || statusLower.includes('approve')) {
      return 'success';
    }
    if (statusLower.includes('pending') || statusLower.includes('warning')) {
      return 'warning';
    }
    if (statusLower.includes('inactive') || statusLower.includes('failed') || statusLower.includes('reject')) {
      return 'danger';
    }
    return 'info';
  })();

  const variantClasses = {
    success: 'bg-[#DCFCE7] text-[#166534]',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${variantClasses[autoVariant]}`}>
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info']),
};
