/** Shared weekly completion bar chart */

export function WeekChart({ series, ariaLabel = 'Last seven days completion rate' }) {
  const summary = series.map((c) => `${c.label} ${c.pct}%`).join(', ');
  return (
    <div className="week-chart" role="img" aria-label={`${ariaLabel}. ${summary}`}>
      {series.map((cell, i) => {
        const height = cell.pct <= 0 ? 0 : Math.max(8, cell.pct);
        return (
          <div key={i} className="week-chart__col">
            <div className="week-chart__track">
              <div
                className={`week-chart__bar${cell.pct <= 0 ? ' week-chart__bar--empty' : ''}`}
                style={{ height: cell.pct <= 0 ? '3px' : `${height}%` }}
                title={`${cell.label}: ${cell.pct}%`}
              />
            </div>
            <span className="week-chart__label">{cell.label}</span>
          </div>
        );
      })}
    </div>
  );
}
