import { useEffect, useState } from 'react'
import { SITE } from '../config'

const resolve = (p) => {
  if (/^(https?:|data:|blob:)/.test(p)) return p
  if (p.startsWith(import.meta.env.BASE_URL)) return p
  return import.meta.env.BASE_URL + p.replace(/^\/+/, '')
}

export default function Background({ activeIndex }) {
  const { backgrounds = [], backgroundVideo = '', backgroundMode = '', backgroundSpeed = 1 } = SITE
  const bgList = Array.isArray(backgrounds) ? backgrounds : []
  const speed = backgroundSpeed && backgroundSpeed > 0 ? backgroundSpeed : 1
  const [tilePx, setTilePx] = useState(null)

  const mode =
    backgroundMode ||
    (backgroundVideo
      ? 'video'
      : bgList.length > 1
        ? 'crossfade'
        : bgList.length === 1
          ? 'static'
          : 'none')

  // Measure the image's rendered tile width (aspect * viewport height) so the
  // scroll loop wraps by exactly one tile — a seamless, invisible seam.
  useEffect(() => {
    if (mode !== 'scroll' || !bgList[0]) return
    const img = new Image()
    img.onload = () => {
      if (!img.naturalWidth) return
      const set = () => setTilePx(Math.round((img.naturalWidth / img.naturalHeight) * window.innerHeight))
      set()
      window.addEventListener('resize', set)
      return () => window.removeEventListener('resize', set)
    }
    img.src = resolve(bgList[0])
    return () => {
      img.src = ''
    }
  }, [mode, bgList[0]]) // eslint-disable-line react-hooks/exhaustive-deps

  if (mode === 'none') return null

  return (
    <div className="bg-scene" aria-hidden="true">
      {mode === 'video' ? (
        <video
          className="bg-video"
          src={resolve(backgroundVideo)}
          autoPlay
          muted
          loop
          playsInline
          poster={bgList[0] ? resolve(bgList[0]) : undefined}
        />
      ) : mode === 'scroll' ? (
        <div
          className="bg-layers mode-scroll"
          style={{ '--tile': tilePx ? `${tilePx}px` : '1600px' }}
        >
          <div
            className="bg-layer bg-marquee"
            style={{
              backgroundImage: `url(${resolve(bgList[0])})`,
              animationDuration: `${Math.max(0.5, 40 / speed)}s`,
            }}
          />
        </div>
      ) : mode === 'kenburns' ? (
        <div
          className="bg-layer bg-kenburns"
          style={{
            backgroundImage: `url(${resolve(bgList[0])})`,
            animationDuration: `${Math.max(1, 60 / speed)}s`,
          }}
        />
      ) : mode === 'static' ? (
        <div className="bg-layer" style={{ backgroundImage: `url(${resolve(bgList[0])})` }} />
      ) : (
        <div className="bg-layers mode-crossfade">
          {bgList.map((bg, i) => (
            <div
              key={bg}
              className="bg-layer"
              style={{
                backgroundImage: `url(${resolve(bg)})`,
                opacity: i === activeIndex % bgList.length ? 1 : 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
