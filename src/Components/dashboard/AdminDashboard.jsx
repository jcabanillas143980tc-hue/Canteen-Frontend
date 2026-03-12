import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './AdminDashboard.css';

/* ─── Colour palette ─── */
const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e','#14b8a6'];

/* ─── Formatters ─── */
const peso  = v => `₱${Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const short = v => v >= 1000 ? `₱${(v/1000).toFixed(1)}k` : `₱${v}`;

/* ─── Label helpers ─── */
// daily-sales returns { date: "2025-05-01" } → "May 1"
const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month:'short', day:'numeric' });
// weekly-sales returns { week: 202518 } → "Wk 18"
const fmtWeek = w => { const s = String(w); return `Wk ${s.slice(4)}`; };

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`dash-stat-card dash-stat-${color}`}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-body">
        <div className="dash-stat-value">{value}</div>
        <div className="dash-stat-label">{label}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────── */
function CustomTooltip({ active, payload, label, type }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="dash-tooltip-row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span>{type === 'currency' ? peso(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   DEFAULT EXPORT — Admin Dashboard
───────────────────────────────────────── */
export default function AdminDashboard() {
  const [period,    setPeriod]    = useState('weekly');
  const [summary,   setSummary]   = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [pieData,   setPieData]   = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topItems,  setTopItems]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [sumRes, salesRes, catRes, trendRes, topRes] = await Promise.allSettled([
        // summary → { total_sales, total_orders, average_order, cancelled_orders }
        api.get('/reports/summary'),

        // sales chart — daily: { date, revenue, orders } | weekly: { week, revenue, orders }
        period === 'weekly'
          ? api.get('/reports/weekly-sales')
          : api.get('/reports/daily-sales?days=30'),

        // pie → { category, revenue, quantity }
        api.get('/reports/category-breakdown'),

        // line trend — always daily last 30 days: { date, revenue, orders }
        api.get('/reports/daily-sales?days=30'),

        // top items → { menu_item_id, total_qty, total_revenue, menu_item: { name, category: { name } } }
        api.get('/reports/top-items?limit=5'),
      ]);

      /* ── Summary ── */
      if (sumRes.status === 'fulfilled') {
        const d = sumRes.value.data;
        setSummary({
          total_sales:       d.total_sales       ?? 0,
          total_orders:      d.total_orders      ?? 0,
          avg_order_value:   d.average_order     ?? 0,   // backend key is "average_order"
          cancelled_orders:  d.cancelled_orders  ?? 0,
        });
      }

      /* ── Bar chart ── */
      if (salesRes.status === 'fulfilled') {
        const raw = salesRes.value.data ?? [];
        setSalesData(raw.map(r => ({
          label:   period === 'weekly' ? fmtWeek(r.week) : fmtDate(r.date),
          revenue: parseFloat(r.revenue ?? 0),
          orders:  parseInt(r.orders   ?? 0, 10),
        })));
      }

      /* ── Pie chart — backend key is "category" not "name" ── */
      if (catRes.status === 'fulfilled') {
        const raw = catRes.value.data ?? [];
        setPieData(raw.map(r => ({
          name:  r.category,                      // backend returns "category"
          value: parseFloat(r.revenue  ?? 0),
        })));
      }

      /* ── Line chart (always daily) ── */
      if (trendRes.status === 'fulfilled') {
        const raw = trendRes.value.data ?? [];
        setTrendData(raw.map(r => ({
          date:   fmtDate(r.date),
          orders: parseInt(r.orders ?? 0, 10),
        })));
      }

      /* ── Top items ── */
      if (topRes.status === 'fulfilled') {
        const raw = topRes.value.data ?? [];
        setTopItems(raw.slice(0, 5).map(r => ({
          id:           r.menu_item_id,
          name:         r.menu_item?.name             ?? `Item #${r.menu_item_id}`,
          category:     r.menu_item?.category?.name   ?? '—',
          total_qty:    parseInt(r.total_qty           ?? 0, 10),
          total_revenue: parseFloat(r.total_revenue   ?? 0),
        })));
      }

    } catch (e) {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;

  return (
    <div className="dash-root">

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">📊 Admin Dashboard</h1>
          <p className="dash-subtitle">Sales reports &amp; system overview</p>
        </div>
        <div className="dash-period-wrap">
          {['daily','weekly'].map(p => (
            <button key={p} className={`dash-period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}>
              {p === 'daily' ? 'Daily (30d)' : 'Weekly (8wk)'}
            </button>
          ))}
          <button className="dash-refresh-btn" onClick={load}>🔄</button>
        </div>
      </div>

      {error && <div className="dash-error">⚠️ {error}</div>}

      {/* ── Summary Cards ── */}
      <div className="dash-stats">
        <StatCard icon="💰" label="Total Sales" color="orange"
          value={summary ? peso(summary.total_sales) : '—'}
          sub={summary ? `${summary.total_orders} completed orders` : ''} />
        <StatCard icon="🛒" label="Total Orders" color="blue"
          value={summary?.total_orders ?? '—'}
          sub={summary ? `Avg ${peso(summary.avg_order_value)} / order` : ''} />
        <StatCard icon="❌" label="Cancelled Orders" color="red"
          value={summary?.cancelled_orders ?? '—'}
          sub="This month" />
        <StatCard icon="📊" label="Avg Order Value" color="green"
          value={summary ? peso(summary.avg_order_value) : '—'}
          sub="Per completed order" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="dash-charts-row">

        {/* Bar Chart — Sales Revenue */}
        <div className="dash-chart-card dash-chart-lg">
          <div className="dash-chart-header">
            <h2>📈 Sales Revenue</h2>
            <span className="dash-chart-sub">{period === 'weekly' ? 'last 8 weeks' : 'last 30 days'}</span>
          </div>
          {salesData.length === 0 ? (
            <div className="dash-no-data">No sales data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={short} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip type="currency" />} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#f97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Category Breakdown */}
        <div className="dash-chart-card dash-chart-sm">
          <div className="dash-chart-header">
            <h2>🥧 Sales by Category</h2>
            <span className="dash-chart-sub">distribution</span>
          </div>
          {pieData.length === 0 ? (
            <div className="dash-no-data">No category data available.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => peso(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-legend">
                {pieData.map((d, i) => (
                  <div key={i} className="dash-legend-item">
                    <span className="dash-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="dash-legend-name">{d.name}</span>
                    <span className="dash-legend-val">{peso(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="dash-charts-row">

        {/* Line Chart — Order Trend (always daily) */}
        <div className="dash-chart-card dash-chart-lg">
          <div className="dash-chart-header">
            <h2>📉 Order Volume Trend</h2>
            <span className="dash-chart-sub">past 30 days</span>
          </div>
          {trendData.length === 0 ? (
            <div className="dash-no-data">No trend data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip type="count" />} />
                <Legend />
                <Line type="monotone" dataKey="orders" name="Orders"
                  stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Items Table */}
        <div className="dash-chart-card dash-chart-sm">
          <div className="dash-chart-header">
            <h2>🏆 Top Selling Items</h2>
            <span className="dash-chart-sub">by quantity</span>
          </div>
          {topItems.length === 0 ? (
            <div className="dash-no-data">No items data available.</div>
          ) : (
            <div className="dash-top-items">
              {topItems.map((item, i) => (
                <div key={item.id ?? i} className="dash-top-item">
                  <div className="dash-top-rank">{i + 1}</div>
                  <div className="dash-top-info">
                    <div className="dash-top-name">{item.name}</div>
                    <div className="dash-top-cat">{item.category}</div>
                  </div>
                  <div className="dash-top-stats">
                    <div className="dash-top-qty">{item.total_qty} sold</div>
                    <div className="dash-top-rev">{peso(item.total_revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────
   NAMED EXPORT — User Management
   Used at route: /users   (admin only)
───────────────────────────────────────── */

function AddUserModal({ onSave, onClose }) {
  const [form,   setForm]   = useState({ name: '', email: '', password: '', role: 'customer' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setF = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name     = 'Name is required';
    if (!form.email.trim()) e.email    = 'Email is required';
    if (!form.password)     e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await api.post('/users', form); onSave(); }
    catch (err) {
      const errs = err.response?.data?.errors || {};
      if (err.response?.data?.message) setErrors({ email: err.response.data.message });
      else setErrors(errs);
    } finally { setSaving(false); }
  };

  return (
    <div className="um-overlay">
      <div className="um-modal">
        <div className="um-modal-header">
          <h2>➕ Add New User</h2>
          <button className="um-close" onClick={onClose}>✕</button>
        </div>
        <div className="um-modal-body">
          {[
            { key:'name',     label:'Full Name *',      type:'text',     ph:'e.g. Juan dela Cruz' },
            { key:'email',    label:'Email Address *',  type:'email',    ph:'user@school.edu' },
            { key:'password', label:'Password *',       type:'password', ph:'Min. 6 characters' },
          ].map(f => (
            <div key={f.key} className="um-field">
              <label>{f.label}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.ph}
                onChange={e => setF(f.key, e.target.value)} />
              {errors[f.key] && <span className="um-err">{errors[f.key]}</span>}
            </div>
          ))}
          <div className="um-field">
            <label>Role *</label>
            <select value={form.role} onChange={e => setF('role', e.target.value)}>
              <option value="customer">🎓 Customer (Student)</option>
              <option value="cashier">🧾 Cashier</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
          <div className="um-footer">
            <button className="um-btn um-btn-sec" onClick={onClose}>Cancel</button>
            <button className="um-btn um-btn-pri" onClick={handleSave} disabled={saving}>
              {saving ? 'Creating…' : '✅ Create User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAdd,    setShowAdd]    = useState(false);
  const [updating,   setUpdating]   = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateUser = async (id, patch) => {
    setUpdating(p => ({ ...p, [id]: true }));
    try {
      await api.patch(`/users/${id}`, patch);
      setUsers(p => p.map(u => u.id === id ? { ...u, ...patch } : u));
    } catch (e) { console.error(e); }
    finally { setUpdating(p => ({ ...p, [id]: false })); }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/users/${user.id}`); setUsers(p => p.filter(u => u.id !== user.id)); }
    catch (e) { alert(e.response?.data?.message || 'Could not delete user.'); }
  };

  const AVA  = { admin:'um-ava-orange', cashier:'um-ava-blue', customer:'um-ava-green' };
  const filtered = users.filter(u => {
    const ms = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mr = !roleFilter || u.role === roleFilter;
    return ms && mr;
  });

  return (
    <div>
      <div className="um-header">
        <h1 className="page-title">👥 User Management</h1>
        <button className="um-btn um-btn-pri" onClick={() => setShowAdd(true)}>➕ Add User</button>
      </div>
      <div className="um-stats">
        {[
          { label:'Total',     val: users.length,                             cls:'' },
          { label:'Admins',    val: users.filter(u=>u.role==='admin').length,    cls:'um-stat-orange' },
          { label:'Cashiers',  val: users.filter(u=>u.role==='cashier').length,  cls:'um-stat-blue' },
          { label:'Customers', val: users.filter(u=>u.role==='customer').length, cls:'um-stat-green' },
        ].map(s => (
          <div key={s.label} className={`um-stat-card ${s.cls}`}>
            <div className="um-stat-val">{s.val}</div>
            <div className="um-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="um-toolbar">
        <div className="um-search-wrap">
          <input className="um-search" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="um-role-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="cashier">Cashier</option>
          <option value="customer">Customer</option>
        </select>
        <button className="um-btn um-btn-sec" onClick={load}>🔄 Refresh</button>
      </div>
      {loading ? <LoadingSpinner message="Loading users…" /> : (
        <div className="um-table-card">
          <table className="um-table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center',padding:40,color:'#94a3b8'}}>No users found.</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="um-user-cell">
                      <div className={`um-ava ${AVA[user.role]||''}`}>{user.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="um-uname">{user.name}</div>
                        <div className="um-uemail">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select className="um-inline-select" value={user.role} disabled={!!updating[user.id]}
                      onChange={e => updateUser(user.id, { role: e.target.value })}>
                      <option value="admin">Admin</option>
                      <option value="cashier">Cashier</option>
                      <option value="customer">Customer</option>
                    </select>
                  </td>
                  <td>
                    <label className="um-toggle">
                      <input type="checkbox" checked={user.is_active !== false} disabled={!!updating[user.id]}
                        onChange={() => updateUser(user.id, { is_active: !(user.is_active !== false) })} />
                      <span className="um-toggle-track" />
                    </label>
                    <span className="um-toggle-lbl">{user.is_active !== false ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="um-date">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}) : '—'}
                  </td>
                  <td>
                    <button className="um-btn um-btn-del um-btn-sm" onClick={() => handleDelete(user)} disabled={!!updating[user.id]}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && <AddUserModal onSave={() => { setShowAdd(false); load(); }} onClose={() => setShowAdd(false)} />}
    </div>
  );
}