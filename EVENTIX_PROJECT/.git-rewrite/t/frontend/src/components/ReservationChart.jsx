import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#10b981", "#f59e0b"];

export default function ReservationChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="dashboard-card chart-card">
      <div className="card-header">
        <div>
          <p className="card-kicker">Reservations</p>
          <h2>Suivi des reservations</h2>
        </div>
        <span className="status-pill status-pill-green">{total}% total</span>
      </div>

      <div className="reservation-chart-layout">
        <div className="pie-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={68}
                outerRadius={102}
                paddingAngle={4}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: "0",
                  borderRadius: "12px",
                  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-center">
            <strong>{total}</strong>
            <span>reservations</span>
          </div>
        </div>

        <div className="chart-legend">
          {data.map((item, index) => (
            <div className="legend-row" key={item.name}>
              <span className="legend-dot" style={{ backgroundColor: COLORS[index] }} />
              <span>{item.name}</span>
              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
