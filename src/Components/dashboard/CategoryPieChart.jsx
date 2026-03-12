import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './CategoryPieChart.css';

const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#ec4899'];

export default function CategoryPieChart({ data = [] }) {
  const fmt = v => `₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  return (
    <div className="chart-card">
      <div className="chart-title">🍽️ Sales by Category</div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="revenue" nameKey="category"
            cx="50%" cy="45%" outerRadius={80}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false} fontSize={11}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={v => [fmt(v), 'Revenue']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}