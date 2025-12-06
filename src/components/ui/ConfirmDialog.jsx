import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog - Reusable confirmation dialog for destructive actions
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Confirmation message
 * @param {string} [props.confirmText] - Confirm button text
 * @param {string} [props.cancelText] - Cancel button text
 * @param {string} [props.variant] - Variant: 'danger' | 'warning' | 'info'
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
            <AlertTriangle className={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'} size={24} />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'info']),
};
