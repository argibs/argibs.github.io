import { useRef, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './BaseModal.module.css';

// Refs are registered during commit, before Radix's passive Escape-listener handoff.
const escapeHandlers = new WeakMap<HTMLElement, () => void>();

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
  label?: string;
}

export default function BaseModal({
  open, onClose, children, header, footer, variant = 'project',
  showCloseButton = true, closeOnOverlayClick = true, closeOnEsc = true,
  lockBodyScroll = true, dialogClassName, labelledBy, label = 'Project details',
}: BaseModalProps) {
  const invokingElement = useRef<HTMLElement | null>(null);
  const dialogElement = useRef<HTMLDivElement | null>(null);
  const Overlay = lockBodyScroll ? Dialog.Overlay : 'div';

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        {open && <Overlay className={`${styles.overlay} ${styles[variant]}`}>
          <Dialog.Content
            data-portfolio-dialog=""
            ref={(node) => {
              if (!node) return;
              dialogElement.current = node;
              escapeHandlers.set(node, () => { if (closeOnEsc) onClose(); });
              return () => {
                escapeHandlers.delete(node);
                dialogElement.current = null;
              };
            }}
            className={`${styles.dialog} ${dialogClassName ?? ''}`}
            {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
            aria-describedby={undefined}
            onOpenAutoFocus={() => {
              invokingElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (invokingElement.current?.isConnected) invokingElement.current.focus();
            }}
            onEscapeKeyDown={(event) => {
              if (event.defaultPrevented) return;
              const dialogs = document.querySelectorAll<HTMLElement>('[data-portfolio-dialog]');
              const top = dialogs[dialogs.length - 1];
              if (top && top !== dialogElement.current) {
                // The parent's listener can briefly remain active after a nested
                // Content mounts. Consume it and close only the committed top dialog.
                event.preventDefault();
                escapeHandlers.get(top)?.();
              } else if (!closeOnEsc) event.preventDefault();
            }}
            onPointerDownOutside={(event) => { if (!closeOnOverlayClick) event.preventDefault(); }}
          >
            <Dialog.Title className={styles.srOnly}>{label}</Dialog.Title>
            {showCloseButton && <Dialog.Close className={styles.close} aria-label="Close">&times;</Dialog.Close>}
            {header && <div className={styles.header}>{header}</div>}
            <div className={styles.body}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </Dialog.Content>
        </Overlay>}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
