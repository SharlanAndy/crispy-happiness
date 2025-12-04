import PropTypes from 'prop-types';

/**
 * StatusBadge - Reusable status indicator
 * 
 * @param {Object} props
 * @param {string} props.status - Status text to display
 * @param {string} [props.variant] - Color variant: 'success' | 'warning' | 'danger' | 'info'
 * @param {boolean} [props.small] - If true, use text-xs; if false, use text-md (default: true)
 */
export default function StatusBadge({ status, variant, small = true }) {
  // Auto-detect variant from status text if not provided
  const autoVariant = variant || (() => {
    const statusLower = status.toLowerCase();
    // Check for inactive/failed/rejected first (danger)
    if (statusLower.includes('inactive') || statusLower.includes('failed') || statusLower.includes('reject')) {
      return 'danger';
    }
    // Check for active/success/approved (success)
    if (statusLower.includes('active') || statusLower.includes('success') || statusLower.includes('approve')) {
      return 'success';
    }
    // Check for pending/warning (warning)
    if (statusLower.includes('pending') || statusLower.includes('warning')) {
      return 'warning';
    }
    return 'info';
  })();

  const variantClasses = {
    success: 'bg-[#DCFCE7] text-[#166534]',
    warning: 'bg-[#FDF9C9] text-[#7D4F1F]',
    danger: 'bg-[#F9E3E3] text-[#8B2822]',
    info: 'bg-gray-100 text-gray-700',
  };

  const sizeClass = small ? 'text-xs px-3 py-1.5 rounded-full' : 'text-md px-3 py-2 rounded-md';

  return (
    <span className={`${sizeClass} font-medium ${variantClasses[autoVariant]}`}>
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info']),
  small: PropTypes.bool,
};
