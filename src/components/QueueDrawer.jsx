import { motion, AnimatePresence } from 'framer-motion'
import { List, X } from 'lucide-react'

export default function QueueDrawer({ tracks, currentIndex, open, onToggle, onSelect }) {
  return (
    <>
      <button className="control-btn queue-toggle" onClick={onToggle} aria-label="Toggle queue" title="Mehfil">
        <List size={20} style={{ color: open ? 'var(--accent)' : undefined }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.aside
            className="drawer"
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.45 }}
          >
            <div className="drawer-header">
              <span className="drawer-title">Mehfil</span>
              <button className="control-btn" onClick={onToggle} aria-label="Close queue">
                <X size={18} />
              </button>
            </div>
            <div className="drawer-list">
              {tracks.map((t, i) => (
                <button
                  key={t.videoId}
                  className={`drawer-item ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => onSelect(i)}
                >
                  <img src={`https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`} alt="" loading="lazy" />
                  <span className="drawer-item-text">
                    <span className="drawer-item-title">{t.title}</span>
                    <span className="drawer-item-artist">{t.artist}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
