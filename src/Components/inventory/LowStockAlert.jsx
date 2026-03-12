import './LowStockAlert.css';

export default function LowStockAlert({ items = [] }) {
  const low = items.filter(i => i.is_low_stock);
  if (!low.length) return null;
  return (
    <div className="low-stock-banner">
      <span className="low-stock-icon">⚠️</span>
      <div className="low-stock-content">
        <strong>{low.length} item{low.length > 1 ? 's' : ''} running low on stock</strong>
        <span className="low-stock-names">{low.map(i => i.name).join(', ')}</span>
      </div>
    </div>
  );
}