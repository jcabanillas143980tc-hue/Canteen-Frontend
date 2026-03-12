export default function MenuItemCard({
  item, canManage, customerView,
  onEdit, onToggle, onDelete, onAddToCart,
}) {
  const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
 
  return (
    <div
      className="card border-0 shadow-sm h-100"
      style={{
        borderRadius: 16,
        opacity: item.is_available ? 1 : 0.65,
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Image */}
      <div className="position-relative overflow-hidden"
        style={{ height: 160, borderRadius: '16px 16px 0 0', background: '#f8fafc' }}>
        {item.image
          ? <img src={`${API}/storage/${item.image}`} alt={item.name}
              className="w-100 h-100" style={{ objectFit: 'cover' }} />
          : <div className="w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ fontSize: 52 }}>🍽️</div>
        }
        {/* Status badges */}
        <div className="position-absolute top-0 start-0 p-2 d-flex gap-1 flex-wrap">
          {!item.is_available && (
            <span className="badge" style={{ background: '#ef4444', fontSize: '0.7rem' }}>
              Out of Stock
            </span>
          )}
          {item.is_low_stock && item.is_available && (
            <span className="badge" style={{ background: '#f59e0b', fontSize: '0.7rem' }}>
              ⚠️ Low Stock
            </span>
          )}
        </div>
      </div>
 
      {/* Body */}
      <div className="card-body d-flex flex-column p-3">
        {/* Category */}
        <div className="mb-1">
          <span className="badge rounded-pill px-2"
            style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', fontWeight: 500 }}>
            {item.category?.icon} {item.category?.name}
          </span>
        </div>
 
        {/* Name */}
        <div className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '0.95rem' }}>
          {item.name}
        </div>
 
        {/* Description */}
        {item.description && (
          <div className="text-muted mb-2" style={{
            fontSize: '0.78rem', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.description}
          </div>
        )}
 
        {/* Footer row */}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2"
          style={{ borderTop: '1px solid #f1f5f9' }}>
          <span className="fw-bold" style={{ color: '#f97316', fontSize: '1.05rem' }}>
            ₱{parseFloat(item.price).toFixed(2)}
          </span>
 
          {/* Admin CRUD */}
          {canManage && (
            <div className="d-flex gap-1">
              <button className="btn btn-sm" title="Toggle availability"
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '4px 9px' }}
                onClick={() => onToggle(item)}>
                {item.is_available ? '🔒' : '🔓'}
              </button>
              <button className="btn btn-sm" title="Edit"
                style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '4px 9px' }}
                onClick={() => onEdit(item)}>✏️</button>
              <button className="btn btn-sm" title="Delete"
                style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '4px 9px' }}
                onClick={() => onDelete(item)}>🗑️</button>
            </div>
          )}
 
          {/* Customer — Add to Cart */}
          {customerView && !canManage && (
            <button
              className="btn btn-sm fw-semibold"
              style={{
                background: item.is_available ? '#f97316' : '#e2e8f0',
                color: item.is_available ? '#fff' : '#94a3b8',
                border: 'none', borderRadius: 10,
              }}
              disabled={!item.is_available}
              onClick={() => onAddToCart(item)}
            >
              + Add
            </button>
          )}
 
          {/* Cashier — read-only stock */}
          {!canManage && !customerView && (
            <span className="badge"
              style={{ background: '#f1f5f9', color: '#64748b', fontWeight: 500 }}>
              Stock: {item.stock_quantity}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}