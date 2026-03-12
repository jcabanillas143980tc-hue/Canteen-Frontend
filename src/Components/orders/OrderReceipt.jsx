export default function OrderReceipt({ order, onClose }) {
  if (!order) return null;
 
  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 420 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: 20 }}>
 
          {/* Receipt header — coloured band */}
          <div
            className="d-flex flex-column align-items-center py-4 px-4 text-white"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mb-2"
              style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', fontSize: 28 }}
            >
              🍱
            </div>
            <h5 className="fw-bold mb-0">CanteenPro</h5>
            <div className="small opacity-75 mb-2">Order Confirmed!</div>
            <div
              className="px-3 py-1 rounded-pill fw-bold"
              style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', letterSpacing: 1 }}
            >
              {order.order_number}
            </div>
          </div>
 
          {/* Items */}
          <div className="px-4 pt-3 pb-2">
            {order.order_items?.map(i => (
              <div key={i.id} className="d-flex justify-content-between align-items-center py-2"
                style={{ borderBottom: '1px dashed #f1f5f9' }}>
                <span className="small" style={{ color: '#475569' }}>
                  {i.menu_item?.name}
                  <span className="ms-1 text-muted">× {i.quantity}</span>
                </span>
                <span className="fw-semibold small" style={{ color: '#1e293b' }}>
                  ₱{parseFloat(i.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
 
            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
              <span className="fw-bold" style={{ color: '#1e293b' }}>TOTAL</span>
              <span className="fw-bold" style={{ color: '#f97316', fontSize: '1.15rem' }}>
                ₱{parseFloat(order.total_amount).toFixed(2)}
              </span>
            </div>
 
            {/* Payment method */}
            <div
              className="d-flex align-items-center gap-2 rounded-3 px-3 py-2 mt-3"
              style={{ background: '#f8fafc' }}
            >
              <span>💳</span>
              <span className="small text-muted">Payment:</span>
              <span className="small fw-semibold" style={{ color: '#1e293b' }}>
                {order.payment_method?.toUpperCase()}
              </span>
            </div>
          </div>
 
          {/* Footer */}
          <div className="px-4 pb-4 pt-2 text-center">
            <p className="text-muted small mb-3">Thank you for your order! 🙏</p>
            <button
              className="btn w-100 fw-semibold text-white"
              style={{ background: '#f97316', border: 'none', borderRadius: 12, padding: '10px' }}
              onClick={onClose}
            >
              Close Receipt
            </button>
          </div>
 
        </div>
      </div>
    </div>
  );
}