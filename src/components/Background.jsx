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

  const mode =
    backgroundMode ||
    (backgroundVideo
      ? 'video'
      : bgList.length > 1
        ? 'crossfade'
        : bgList.length === 1
          ? 'static'
          : 'none')

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
        <div className="bg-layers mode-scroll">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-layer bg-marquee"
              style={{
                backgroundImage: `url(${resolve(bgList[0])})`,
                animationDuration: `${Math.max(0.5, 40 / speed)}s`,
              }}
            />
          ))}
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
