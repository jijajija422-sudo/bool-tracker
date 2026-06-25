import React from 'react';
import { X } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { cn } from '../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-4xl h-[95vh] md:h-auto md:max-h-[90vh]',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  titleId = 'modal-title',
  children,
  className,
  size = 'lg',
  showClose = true,
}) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 bg-sage-900 bg-opacity-40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'bg-white w-full rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex justify-between items-center p-6 md:p-8 pb-0 md:pb-0 shrink-0">
          <h2 id={titleId} className="text-xl md:text-2xl font-serif font-bold text-sage-900">
            {title}
          </h2>
          {showClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-sage-50 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X size={24} className="text-sage-400" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
