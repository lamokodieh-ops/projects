export function ProgressBar({ value, max = 100, label }) {
  const pct = max <= 0 ? 0 : Math.round((Math.min(max, Math.max(0, value)) / max) * 100);
  return (
    <div className="progress-wrap">
      {label ? <span className="progress-wrap__label muted">{label}</span> : null}
      <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
