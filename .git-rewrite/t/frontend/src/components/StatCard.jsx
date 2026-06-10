export default function StatCard({
  title,
  value,
  icon,
  tone,
  trend,
  description
}) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-trend">{trend}</span>
      </div>

      <div>
        <p className="stat-title">{title}</p>
        <h2 className="stat-value">{value}</h2>
        <p className="stat-description">{description}</p>
      </div>
    </article>
  );
}
