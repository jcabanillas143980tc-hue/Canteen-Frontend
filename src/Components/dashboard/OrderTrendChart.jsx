// src/Components/dashboard/OrderTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function OrderTrendChart({ data = [], loading }) {
  if (loading) return <div className="skeleton" style={{ height: 180, borderRadius: 12 }} />

  return (
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
          stroke="#5c7aff" strokeWidth={2}
          dot={{ r: 3, fill: '#5c7aff' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}