/**
 * Pagination component
 */
export default function Pagination({ page, pages, total, limit, onPageChange }) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const nums = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      nums.push(i);
    }
    return nums;
  };

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing <strong>{from}</strong> – <strong>{to}</strong> of <strong>{total}</strong> results
      </div>
      <div className="pagination-controls">
        <button className="page-btn" onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">«</button>
        <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">‹</button>

        {page > 3 && <><button className="page-btn" onClick={() => onPageChange(1)}>1</button><span style={{color:'var(--text-muted)'}}>…</span></>}
        {getPageNumbers().map((n) => (
          <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => onPageChange(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>
        ))}
        {page < pages - 2 && <><span style={{color:'var(--text-muted)'}}>…</span><button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button></>}

        <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages} aria-label="Next page">›</button>
        <button className="page-btn" onClick={() => onPageChange(pages)} disabled={page === pages} aria-label="Last page">»</button>
      </div>
    </div>
  );
}
