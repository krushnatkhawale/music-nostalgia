import { useState } from 'react'
import { Volume2, Volume1, VolumeX } from 'lucide-react'

export default function VolumeControl({ volume, onChange }) {
  const [open, setOpen] = useState(false)
  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      className="volume"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="control-btn"
        aria-label="Volume"
        onClick={() => onChange(volume === 0 ? 0.7 : 0)}
      >
        <Icon size={18} />
      </button>
      {open && (
        <input
          className="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          aria-label="Volume slider"
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      )}
    </div>
  )
}
