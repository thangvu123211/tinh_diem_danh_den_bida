import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import Modal from '../modal/modal';
import { IconCheck, IconClose, IconHelp } from '../icons';
import './confirm-dialog.css';

type ConfirmFn = (message: string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Hiển thị hộp thoại xác nhận, trả về true nếu người dùng bấm "Xác nhận". */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm phải nằm trong <ConfirmProvider>');
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(msg => {
    setMessage(msg);
    return new Promise<boolean>(resolve => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setMessage(null);
  }, []);

  const onCancel = useCallback(() => close(false), [close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={message !== null} onClose={onCancel}>
        <div className="confirm">
          <div className="confirm-diamonds">
            {Array.from({ length: 5 }, (_, i) => <span key={i} />)}
          </div>

          <div className="confirm-icon">
            <IconHelp />
          </div>

          <h2 className="confirm-title">Xác Nhận</h2>
          <p className="confirm-message">{message}</p>

          <div className="confirm-actions">
            <button className="btn btn-ghost" onClick={onCancel}>
              <IconClose />
              <span>Hủy</span>
            </button>
            <button className="btn btn-primary" onClick={() => close(true)} autoFocus>
              <IconCheck />
              <span>Xác Nhận</span>
            </button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}
