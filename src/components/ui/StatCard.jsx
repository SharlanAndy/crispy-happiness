import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatCard - Reusable statistics display card
 * 
 * @param {Object} props
 * @param {string} props.label - The label/title of the stat
 * @param {string|number} props.value - The main value to display
 * @param {string} [props.lastUpdate] - Optional last update timestamp
 * @param {string} [props.variant] - Color variant: 'default' | 'primary' | 'success' | 'warning'
 * @param {string} [props.className] - Additional CSS classes
 */
export default function StatCard({ label, value, lastUpdate, variant = 'default', className = '' }) {
  const variantClasses = {
    default: 'text-primary',
    primary: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  };

  return (
    <div className={`p-5 rounded-xl border border-neutral-200 flex flex-col gap-6 ${className}`}>
      <p className="font-honor-sans font-medium leading-[normal] not-italic text-lg text-black">{label}</p>
      <div className="flex flex-col gap-1.5 items-start">
        <h3 className={`font-honor-sans font-bold text-3xl text-black ${variantClasses[variant]}`}>{value}</h3>
        {lastUpdate && (
        <p className="font-honor-sans font-medium text-[#868e8d] text-sm">Last Update: {lastUpdate}</p>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lastUpdate: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning']),
  className: PropTypes.string,
};
