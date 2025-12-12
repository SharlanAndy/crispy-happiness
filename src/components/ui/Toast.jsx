import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    textColor: 'text-green-800',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800',
  },
};

export default function Toast({ id, message, type = 'info', duration = 5000, onClose }) {
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = toastConfig.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`
        ${toastConfig.bgColor} 
        ${toastConfig.borderColor} 
        border 
        rounded-lg 
        shadow-lg 
        p-4 
        mb-3 
        flex 
        items-start 
        gap-3 
        min-w-[300px] 
        max-w-[500px]
        animate-in
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${toastConfig.iconColor}`}>
        <Icon size={20} />
      </div>
      <div className={`flex-1 ${toastConfig.textColor}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${toastConfig.textColor} hover:opacity-70 transition-opacity`}
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
    </div>
  );
}
