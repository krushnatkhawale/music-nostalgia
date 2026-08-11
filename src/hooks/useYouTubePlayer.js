import { useEffect, useRef, useCallback } from 'react'

let apiReadyPromise = null
let playerReadyPromise = null

function loadApi() {
  if (window.YT && window.YT.Player) return Promise.resolve()
  if (!apiReadyPromise) {
    apiReadyPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev && prev()
        resolve()
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    })
  }
  return apiReadyPromise
}

export default function useYouTubePlayer({ initialVideoId, onStateChange, onTime }) {
  const playerRef = useRef(null)
  const readyRef = useRef(false)
  const onStateChangeRef = useRef(onStateChange)
  const onTimeRef = useRef(onTime)
  const pollRef = useRef(null)

  onStateChangeRef.current = onStateChange
  onTimeRef.current = onTime

  const ensureReady = useCallback(async () => {
    if (playerRef.current) return playerRef.current
    await loadApi()
    if (!playerReadyPromise) {
      playerReadyPromise = new Promise((resolve) => {
        const el = document.createElement('div')
        el.id = 'youtube-engine'
        document.getElementById('youtube-root').appendChild(el)
        const p = new window.YT.Player('youtube-engine', {
          videoId: initialVideoId,
          width: 1,
          height: 1,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
          },
          events: {
            onReady: () => {
              readyRef.current = true
              resolve(p)
            },
            onStateChange: (e) => onStateChangeRef.current && onStateChangeRef.current(e.data),
          },
        })
        playerRef.current = p
        if (import.meta.env.DEV) window.__brPlayer = p
      })
    }
    return playerReadyPromise
  }, [initialVideoId])

  useEffect(() => {
    let stopped = false
    ensureReady().then((p) => {
      if (stopped) return
      pollRef.current = setInterval(() => {
        if (readyRef.current && p.getDuration && !Number.isNaN(p.getDuration())) {
          onTimeRef.current?.({
            current: p.getCurrentTime() || 0,
            duration: p.getDuration() || 0,
          })
        }
      }, 250)
    })
    return () => {
      stopped = true
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [ensureReady])

  useEffect(() => {
    const onUnload = () => playerRef.current && playerRef.current.destroy && playerRef.current.destroy()
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  return {
    get isReady() {
      return readyRef.current
    },
    async playVideo(videoId) {
      const p = await ensureReady()
      p.loadVideoById(videoId)
      p.playVideo()
    },
    async togglePlay() {
      const p = await ensureReady()
      if (p.getPlayerState && p.getPlayerState() === window.YT.PlayerState.PLAYING) p.pauseVideo()
      else p.playVideo()
    },
    async play() {
      const p = await ensureReady()
      p.playVideo()
    },
    async pause() {
      const p = await ensureReady()
      p.pauseVideo()
    },
    async seekTo(sec) {
      const p = await ensureReady()
      p.seekTo(sec, true)
    },
    async setVolume(v) {
      const p = await ensureReady()
      p.setVolume(Math.round(v * 100))
    },
    getPlayer() {
      return playerRef.current
    },
  }
}
