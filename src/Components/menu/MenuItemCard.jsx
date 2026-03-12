import './MenuItemCard.css';

export default function MenuItemCard({
  item, canManage, customerView,
  onEdit, onToggle, onDelete, onAddToCart,
}) {
  const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

  return (
    <div className={`menu-card ${!item.is_available ? 'unavailable' : ''}`}>
      <div className="menu-card-img">
        {item.image
          ? <img src={`${API}/storage/${item.image}`} alt={item.name} />
          : <span className="menu-card-emoji">🍽️</span>
        }
        <div className="img-overlay">
          {!item.is_available && <span className="oos-badge">Out of Stock</span>}
          {item.is_low_stock && item.is_available && <span className="low-badge">Low Stock</span>}
        </div>
      </div>

      <div className="menu-card-body">
        <div className="menu-card-cat">{item.category?.icon} {item.category?.name}</div>
        <div className="menu-card-name">{item.name}</div>
        {item.description && <div className="menu-card-desc">{item.description}</div>}

        <div className="menu-card-footer">
          <span className="menu-card-price">₱{parseFloat(item.price).toFixed(2)}</span>

          {/* Admin: show CRUD controls */}
          {canManage && (
            <div className="card-actions">
              <button className="btn-icon" onClick={() => onToggle(item)} title="Toggle availability">
                {item.is_available ? '🔒' : '🔓'}
              </button>
              <button className="btn-icon" onClick={() => onEdit(item)} title="Edit">✏️</button>
              <button className="btn-icon btn-icon-del" onClick={() => onDelete(item)} title="Delete">🗑️</button>
            </div>
          )}

          {/* Customer: show Add to Cart */}
          {customerView && !canManage && (
            <button
              className="btn btn-primary btn-sm"
              disabled={!item.is_available}
              onClick={() => onAddToCart(item)}
            >
              + Add
            </button>
          )}

          {/* Cashier view: read-only — no button */}
          {!canManage && !customerView && (
            <span className="stock-tag">
              Stock: {item.stock_quantity}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}