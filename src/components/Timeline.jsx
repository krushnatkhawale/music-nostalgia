export default function Timeline({ currentTime, duration, onSeek }) {
  const fmt = (s) => {
    if (Number.isNaN(s) || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${String(sec).padStart(2, '0')}`
  }
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  const onClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (duration > 0) onSeek(Math.min(1, Math.max(0, pct)) * duration)
  }

  return (
    <div className="timeline">
      <span className="time">{fmt(currentTime)}</span>
      <div className="progress-bg" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(pct)} onClick={onClick}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <div className="progress-thumb" style={{ left: `${pct}%` }} />
      </div>
      <span className="time">{duration > 0 ? `-${fmt(duration - currentTime)}` : '0:00'}</span>
    </div>
  )
}
