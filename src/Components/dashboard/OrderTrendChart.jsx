import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
 
export function OrderTrendChart({ data = [], loading }) {
  if (loading) {
    return (
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <div className="placeholder-glow">
            <div className="placeholder rounded-3 w-100" style={{ height: 180 }} />
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body p-4">
        <h6 className="fw-semibold mb-3" style={{ color: '#1e293b' }}>📉 Order Volume Trend</h6>
        {data.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: 180 }}>
            No trend data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={v => [v, 'Orders']}
                contentStyle={{ borderRadius: 10, border: '1px solid #e0e9ff', fontSize: 12 }}
              />
              <Line
                type="monotone" dataKey="orders"
                stroke="#3b82f6" strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
 
export default OrderTrendChart;