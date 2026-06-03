export default function LoadingButton({
  loading = false,
  children,
  loadingText = 'Processing...',
  className = 'btn btn-primary',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button type={type} className={className} disabled={disabled || loading} {...props}>
      {loading ? <><span className="btn-spinner" />&nbsp;{loadingText}</> : children}
    </button>
  );
}
