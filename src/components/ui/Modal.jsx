import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

/**
 * Modal - Reusable modal/dialog component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} [props.footer] - Optional footer content
 * @param {string} [props.size] - Modal size: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-background rounded-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between py-4 px-6 sticky top-0 bg-background z-10">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="py-4 px-6">{children}</div>

        {footer && (
          <div className="py-4 px-6 flex justify-end gap-3 sticky bottom-0 bg-background">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};
