import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md' // max-w-sm, max-w-md, max-w-lg, max-w-xl, etc.
}) => {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Surface */}
      <div className={`relative w-full ${maxWidth} glass-panel rounded-2xl border border-slate-700/60 shadow-2xl p-6 overflow-hidden animate-scaleIn z-10`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <h3 className="text-base font-bold text-white font-heading">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body content */}
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
