import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './BaseModal.module.css';

let scrollLockCount = 0;
let savedOverflow = '';

function acquireScrollLock() {
  if (scrollLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}

function releaseScrollLock() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = savedOverflow;
    savedOverflow = '';
  }
}

const CLOSE_ANIMATION_MS = 280;

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: 'project' | 'challenge' | 'lightbox';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  lockBodyScroll?: boolean;
  dialogClassName?: string;
  labelledBy?: string;
}

export default function BaseModal({
  open,
  onClose,
  children,
  header,
  footer,
  variant = 'project',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  lockBodyScroll = true,
  dialogClassName,
  labelledBy,
}: BaseModalProps) {
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setClosing(false);
      setRendered(true);
    } else if (rendered) {
      setClosing(true);
      closeTimerRef.current = window.setTimeout(() => {
        setRendered(false);
        setClosing(false);
        closeTimerRef.current = null;
      }, CLOSE_ANIMATION_MS);
    }
    return () => {
      if (!open && closeTimerRef.current !== null) {
        // keep timer running on re-renders while closing
      }
    };
  }, [open, rendered]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open || closing) return;
    const handlers: Array<() => void> = [];

    if (closeOnEsc) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKey);
      handlers.push(() => document.removeEventListener('keydown', onKey));
    }

    if (lockBodyScroll) {
      acquireScrollLock();
      handlers.push(() => releaseScrollLock());
    }

    return () => handlers.forEach((fn) => fn());
  }, [open, closing, onClose, closeOnEsc, lockBodyScroll]);

  const handleClose = useCallback(() => {
    if (closing) return;
    onClose();
  }, [closing, onClose]);

  if (!rendered) return null;

  return createPortal(
    <div
      className={`${styles.overlay} ${styles[variant]} ${closing ? styles.closing : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={`${styles.dialog} ${dialogClassName ?? ''}`}>
        {showCloseButton && (
          <button type="button" className={styles.close} aria-label="Close" onClick={handleClose}>
            ×
          </button>
        )}
        {header && <div className={styles.header}>{header}</div>}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
