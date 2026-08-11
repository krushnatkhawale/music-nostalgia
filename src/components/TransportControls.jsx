import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

export default function TransportControls({ isPlaying, onPrev, onToggle, onNext, accent }) {
  return (
    <div className="transport">
      <button className="control-btn" onClick={onPrev} aria-label="Previous track">
        <SkipBack size={20} fill="currentColor" />
      </button>
      <button className="control-btn play-btn" onClick={onToggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="play-glyph" />}
      </button>
      <button className="control-btn" onClick={onNext} aria-label="Next track">
        <SkipForward size={20} fill="currentColor" />
      </button>
    </div>
  )
}
