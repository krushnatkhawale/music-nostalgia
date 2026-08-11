// Regenerates config/tracks.json from a YouTube playlist.
// Reads the playlist id from config/site.json -> defaultPlaylistId.
// Usage: npm run playlist:fetch
//
// Uses the same public, keyless endpoints the YouTube web app uses:
//   1. fetch the playlist page and extract the continuation token
//   2. POST it to /youtubei/v1/browse to enumerate the tracks
// No API key, no login. Scraping policy: only for maintaining our own
// curated track list; re-run when you want to sync the playlist.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const site = JSON.parse(readFileSync(join(root, 'config/site.json'), 'utf8'))
const playlistId = process.argv[2] || site.defaultPlaylistId
if (!playlistId) {
  console.error('No playlist id. Set config/site.json -> defaultPlaylistId or pass as arg.')
  process.exit(1)
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const ytInitialData = (html) => {
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s)
  if (!m) throw new Error('ytInitialData not found on playlist page')
  return JSON.parse(m[1])
}

const walk = (o, fn) => {
  if (Array.isArray(o)) return o.forEach((v) => walk(v, fn))
  if (o && typeof o === 'object') {
    fn(o)
    Object.values(o).forEach((v) => walk(v, fn))
  }
}

const findToken = (data) => {
  let token = null
  walk(data, (node) => {
    if (!token && node.continuationCommand?.token) token = node.continuationCommand.token
  })
  return token
}

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/

const lockupToTrack = (lockup) => {
  const lm = lockup.metadata?.lockupMetadataViewModel ?? {}
  const rows = lm.metadata?.contentMetadataViewModel?.metadataRows ?? []
  const text = (r) => r?.metadataParts?.[0]?.text?.content ?? null
  const videoId = lockup.contentId ?? null
  if (!videoId || !VIDEO_ID_RE.test(videoId)) return null
  return {
    title: lm.title?.content ?? null,
    artist: rows.length ? text(rows[0]) : null,
    videoId,
  }
}

const main = async () => {
  const pageUrl = `https://www.youtube.com/playlist?list=${playlistId}`
  console.log(`Fetching ${pageUrl}`)
  const page = await fetch(pageUrl, { headers: { 'user-agent': UA } })
  const html = await page.text()
  const data = ytInitialData(html)
  const token = findToken(data)

  const tracks = []
  walk(data, (node) => {
    if (node.lockupViewModel) {
      const t = lockupToTrack(node.lockupViewModel)
      if (t && t.title) tracks.push(t)
    }
  })

  if (token) {
    const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1]
    if (!key) throw new Error('INNERTUBE_API_KEY not found')
    const url = `https://www.youtube.com/youtubei/v1/browse?key=${key}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': UA },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB', clientVersion: '2.20240801.00.00' } },
        continuation: token,
      }),
    })
    const cont = await res.json()
    walk(cont, (node) => {
      if (node.lockupViewModel) {
        const t = lockupToTrack(node.lockupViewModel)
        if (t && t.title) tracks.push(t)
      }
    })
  }

  const seen = new Set()
  const unique = tracks.filter((t) => (seen.has(t.videoId) ? false : (seen.add(t.videoId), true)))

  const embeddable = []
  const dropped = []
  for (const t of unique) {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${t.videoId}&format=json`
    const res = await fetch(url, { headers: { 'user-agent': UA } })
    if (res.ok) embeddable.push(t)
    else dropped.push({ ...t, status: res.status })
  }
  if (dropped.length) {
    console.warn(
      `Dropped ${dropped.length} non-embeddable track(s):\n` +
        dropped.map((d) => `  [${d.status}] ${d.title} (${d.videoId})`).join('\n')
    )
  }

  const out = join(root, 'config/tracks.json')
  writeFileSync(out, JSON.stringify(embeddable, null, 2) + '\n')
  console.log(`Wrote ${embeddable.length} tracks to config/tracks.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
