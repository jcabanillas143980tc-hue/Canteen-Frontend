import { useState } from 'react';
import api from '../../services/api';
import './MenuForm.css';

export default function MenuForm({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item ? {
    name: item.name, description: item.description || '', price: item.price,
    category_id: item.category_id, stock_quantity: item.stock_quantity, is_available: item.is_available,
  } : { name: '', description: '', price: '', category_id: '', stock_quantity: '', is_available: true });
  const [image,  setImage]  = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (item?.id) await api.post(`/menu/${item.id}?_method=PUT`, fd, { headers });
      else          await api.post('/menu', fd, { headers });
      onSave();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{item ? 'Edit Menu Item' : '+ Add Menu Item'}</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Item Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Chicken Adobo" required />
              {errors.name && <span className="field-error">{errors.name[0]}</span>}
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              {errors.category_id && <span className="field-error">{errors.category_id[0]}</span>}
            </div>
            <div className="form-group">
              <label>Price (₱) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" required />
              {errors.price && <span className="field-error">{errors.price[0]}</span>}
            </div>
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} placeholder="0" required />
              {errors.stock_quantity && <span className="field-error">{errors.stock_quantity[0]}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description…" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Item Photo</label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label>Availability</label>
              <div className="toggle-row">
                <label className="toggle">
                  <input type="checkbox" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span>{form.is_available ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit"  className="btn btn-primary"  disabled={saving}>
              {saving ? 'Saving…' : item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}