import { useState, useEffect, useCallback } from 'react'
import useYouTubePlayer from './hooks/useYouTubePlayer'
import { SITE, TRACKS } from './config'
import VinylDisc from './components/VinylDisc'
import NowPlaying from './components/NowPlaying'
import Timeline from './components/Timeline'
import TransportControls from './components/TransportControls'
import VolumeControl from './components/VolumeControl'
import QueueDrawer from './components/QueueDrawer'
import LinkPills from './components/LinkPills'

const STORE = {
  get index() {
    const raw = localStorage.getItem('br_index')
    const v = raw === null ? NaN : Number(raw)
    return Number.isInteger(v) && v >= 0 ? v : 0
  },
  set index(v) {
    localStorage.setItem('br_index', String(v))
  },
  get volume() {
    const raw = localStorage.getItem('br_volume')
    const v = raw === null ? NaN : Number(raw)
    return !Number.isNaN(v) && v >= 0 && v <= 1 ? v : 0.8
  },
  set volume(v) {
    localStorage.setItem('br_volume', String(v))
  },
}

export default function App() {
  const [index, setIndex] = useState(() => Math.min(STORE.index, TRACKS.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState({ current: 0, duration: 0 })
  const [volume, setVolume] = useState(STORE.volume)
  const [queueOpen, setQueueOpen] = useState(false)
  const [ready, setReady] = useState(false)

  const track = TRACKS[index] || TRACKS[0]

  const handleState = useCallback((state) => {
    const YTS = window.YT && window.YT.PlayerState
    if (state === YTS.PLAYING) setIsPlaying(true)
    else if (state === YTS.PAUSED || state === YTS.BUFFERING || state === YTS.ENDED) {
      setIsPlaying(false)
      if (state === YTS.ENDED) {
        setIndex((i) => {
          const next = (i + 1) % TRACKS.length
          STORE.index = next
          return next
        })
      }
    }
  }, [])

  const yt = useYouTubePlayer({
    initialVideoId: TRACKS[0].videoId,
    onStateChange: handleState,
    onTime: setTime,
  })

  useEffect(() => {
    STORE.volume = volume
    yt.setVolume(volume)
  }, [volume]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (index >= 0 && index < TRACKS.length) {
      yt.playVideo(TRACKS[index].videoId)
      if (yt.isReady) setReady(true)
    }
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async () => {
    await yt.playVideo(TRACKS[index].videoId)
    setReady(true)
  }, [yt, index])

  const next = useCallback(() => {
    setIndex((i) => {
      const n = (i + 1) % TRACKS.length
      STORE.index = n
      return n
    })
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => {
      const n = (i - 1 + TRACKS.length) % TRACKS.length
      STORE.index = n
      return n
    })
  }, [])

  const select = useCallback((i) => {
    setIndex(i)
    STORE.index = i
  }, [])

  const togglePlay = useCallback(async () => {
    const p = yt.getPlayer()
    if (p && p.getPlayerState && p.getPlayerState() === window.YT.PlayerState.PLAYING) {
      await yt.pause()
    } else {
      await yt.play()
    }
  }, [yt])

  const seek = useCallback(
    (sec) => {
      yt.seekTo(sec)
    },
    [yt]
  )

  const backgrounds = SITE.backgrounds || []
  const accent = SITE.accent || '#f5b301'

  return (
    <div className="app" style={{ '--accent': accent }}>
      <div id="youtube-root" className="youtube-root" aria-hidden="true" />

      {backgrounds.length > 0 && (
        <div className="bg-layers">
          {backgrounds.map((bg) => (
            <div
              key={bg}
              className="bg-layer"
              style={{
                backgroundImage: `url(${bg})`,
                opacity: backgrounds.indexOf(bg) === index % backgrounds.length ? 1 : 0,
              }}
            />
          ))}
        </div>
      )}

      <LinkPills playlists={SITE.playlists} />

      <main className="stage">
        <header className="brand">
          <h1>{SITE.name}</h1>
          <p>{SITE.tagline}</p>
        </header>

        <section className="player">
          <VinylDisc track={track} isPlaying={isPlaying && ready} accent={accent} />
          <NowPlaying title={track.title} artist={track.artist} />

          {ready ? (
            <>
              <Timeline currentTime={time.current} duration={time.duration} onSeek={seek} />
              <div className="bottom-row">
                <TransportControls isPlaying={isPlaying} onPrev={prev} onToggle={togglePlay} onNext={next} accent={accent} />
                <VolumeControl volume={volume} onChange={setVolume} />
              </div>
            </>
          ) : (
            <button className="start-btn" onClick={toggle}>
              Start the radio
            </button>
          )}

          <div className="queue-row">
            <QueueDrawer
              tracks={TRACKS}
              currentIndex={index}
              open={queueOpen}
              onToggle={() => setQueueOpen((o) => !o)}
              onSelect={select}
            />
            <span className="queue-count">{TRACKS.length} tracks</span>
          </div>
        </section>
      </main>

      <footer className="foot">
        Playing full songs via the YouTube IFrame API · Curated list in <code>config/tracks.json</code>
      </footer>
    </div>
  )
}
