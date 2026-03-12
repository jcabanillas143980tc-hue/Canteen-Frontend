import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
 
export function SalesChart({ data = [] }) {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body p-4">
        <h6 className="fw-semibold mb-3" style={{ color: '#1e293b' }}>💰 Daily Revenue <span className="text-muted fw-normal small">Last 30 Days</span></h6>
        {data.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: 240 }}>
            No sales data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={d => d?.slice(5) || ''}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={v => `₱${(v/1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={v => [`₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'Revenue']}
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
 
export default SalesChart;