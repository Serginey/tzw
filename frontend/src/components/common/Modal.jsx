export default function Modal({
  isOpen,
  title,
  subtitle,
  children,
  footer,
  onClose,
  maxWidth = '560px',
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <div>
            {title && <h2 className="modal-title" id="modal-title">{title}</h2>}
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          {onClose && (
            <button className="modal-close" type="button" onClick={onClose} aria-label="Close modal">
              x
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
