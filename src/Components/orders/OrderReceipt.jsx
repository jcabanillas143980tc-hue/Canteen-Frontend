import './OrderReceipt.css';

export default function OrderReceipt({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="receipt" onClick={e => e.stopPropagation()}>
        <div className="receipt-header">
          <div className="receipt-logo">🍱</div>
          <h2>CanteenPro</h2>
          <p>Order Confirmed!</p>
          <div className="receipt-num">{order.order_number}</div>
        </div>

        <div className="receipt-body">
          {order.order_items?.map(i => (
            <div key={i.id} className="receipt-line">
              <span>{i.menu_item?.name} × {i.quantity}</span>
              <span>₱{parseFloat(i.subtotal).toFixed(2)}</span>
            </div>
          ))}
          <div className="receipt-divider" />
          <div className="receipt-total">
            <span>TOTAL</span>
            <span>₱{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
          <div className="receipt-method">
            Payment: {order.payment_method?.toUpperCase()}
          </div>
        </div>

        <div className="receipt-footer">
          <p>Thank you for your order! 🙏</p>
          <button className="btn btn-primary" onClick={onClose}>Close Receipt</button>
        </div>
      </div>
    </div>
  );
}