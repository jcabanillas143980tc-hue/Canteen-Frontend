export default function LowStockAlert({ items = [] }) {
  const low = items.filter(i => i.is_low_stock);
  if (!low.length) return null;
 
  return (
    <div className="alert d-flex align-items-start gap-3 border-0 rounded-3 p-3 mb-3"
      style={{ background: '#fef9c3', borderLeft: '4px solid #eab308' }}>
      <span style={{ fontSize: 22 }}>⚠️</span>
      <div>
        <div className="fw-bold" style={{ color: '#854d0e' }}>
          {low.length} item{low.length > 1 ? 's' : ''} running low on stock
        </div>
        <div className="small mt-1" style={{ color: '#92400e' }}>
          {low.map(i => i.name).join(', ')}
        </div>
      </div>
    </div>
  );
}