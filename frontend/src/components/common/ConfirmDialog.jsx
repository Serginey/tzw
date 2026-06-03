/**
 * ConfirmDialog — uses modal overlay (NOT native browser confirm())
 * SECURITY: Never use native alert/confirm/prompt in production UI.
 */
export default function ConfirmDialog({
  icon = 'Confirm',
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'btn-danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal" style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div className="confirm-icon">{icon}</div>
        <div className="confirm-title" id="confirm-title">{title}</div>
        <div className="confirm-message">{message}</div>
        <div className="modal-footer" style={{ justifyContent: 'center', marginTop: '28px' }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <><span className="btn-spinner" />&nbsp;Processing...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
