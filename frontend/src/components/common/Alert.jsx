import { useEffect } from 'react';

const LABELS = { success: 'Success', danger: 'Error', warning: 'Warning', info: 'Info' };

/**
 * Alert — auto-dismisses after `duration` ms (default 5s)
 */
export default function Alert({ type = 'info', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-icon">{LABELS[type]}</span>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
