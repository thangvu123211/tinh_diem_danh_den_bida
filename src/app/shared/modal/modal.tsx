import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}

export default function Modal({ open, onClose, maxWidth = 380, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        style={{ maxWidth }}
        onMouseDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
