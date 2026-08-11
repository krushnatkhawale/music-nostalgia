import { motion } from 'framer-motion'

export default function VinylDisc({ track, isPlaying, accent }) {
  return (
    <div className="vinyl-wrap">
      <motion.div
        className="vinyl"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={isPlaying ? { repeat: Infinity, ease: 'linear', duration: 6 } : { duration: 0.4 }}
      >
        <img
          src={`https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
          alt={track.title}
          draggable={false}
        />
        <div className="vinyl-label" style={{ boxShadow: `0 0 0 2px ${accent}55` }} />
      </motion.div>
    </div>
  )
}
