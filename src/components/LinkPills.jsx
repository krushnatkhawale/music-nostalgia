export default function LinkPills({ playlists }) {
  const list = Object.values(playlists || {})
  if (!list.length) return null
  return (
    <div className="link-pills">
      {list.map((p) => (
        <a
          key={p.url}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-pill"
          aria-label={`Open on ${p.label}`}
        >
          {p.label}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="link-pill-arrow">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      ))}
    </div>
  )
}
