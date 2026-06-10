import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function SalesChart({ data }) {
  return (
    <article className="dashboard-card chart-card">
      <div className="card-header">
        <div>
          <p className="card-kicker">Performance</p>
          <h2>Statistiques des ventes</h2>
        </div>
        <span className="status-pill status-pill-blue">Mensuel</span>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
            <Tooltip
              cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
              contentStyle={{
                border: "0",
                borderRadius: "12px",
                boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)"
              }}
            />
            <Bar dataKey="ventes" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
