import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card - Reusable card container
 * 
 * @param {Object} props
 * @param {string} [props.title] - Card title
 * @param {React.ReactNode} [props.headerAction] - Action button/component in header
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.noPadding] - Remove default padding
 */
export default function Card({ title, headerAction, children, className = '', noPadding = false }) {
  return (
    <div className={`bg-card rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden p-6 flex flex-col gap-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : ''}>{children}</div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.string,
  headerAction: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  noPadding: PropTypes.bool,
};
