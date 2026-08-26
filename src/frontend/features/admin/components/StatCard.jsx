export function StatCard({
  label,
  value,
  description,
  trend,
  icon,
}) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-top">
        <div>
          <span className="admin-stat-label">{label}</span>
          <strong className="admin-stat-value">{value}</strong>
        </div>

        <div className="admin-stat-icon">
          {icon}
        </div>
      </div>

      <div className="admin-stat-bottom">
        <span className="admin-stat-trend">{trend}</span>
        <span>{description}</span>
      </div>
    </article>
  )
}