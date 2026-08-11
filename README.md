# Barbershop Radio

A saloon-style web radio: **90s Bollywood bangers that play at Indian barber shops.**
One screen, glassy UI, spinning vinyl, full-length songs. Static build, no backend,
no API keys.

## How it works

- **Engine:** the [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
  drives a hidden player. The UI is fully custom-skimmed on top (vinyl, seek, volume,
  queue).
- **Hosting:** plain static files — build with Vite, deploy anywhere (GitHub Pages,
  Render, Netlify).

## Configuration (all from files — no code changes needed)

| File | What it controls |
|------|------------------|
| `config/site.json` | Name, tagline, accent color, default YouTube playlist id, top-right playlist link pills (`playlists`), background image URLs (`backgrounds`, optional) |
| `config/tracks.json` | The curated track list: `[{ "title", "artist", "videoId" }]` |

- Tracks currently seeded from the `saloon.wtf` YouTube playlist (`PLTJ1PnzCWyFw`)
  — 61 embeddable tracks, one age-restricted video dropped.
- Regenerate the track list any time with `npm run playlist:fetch` (reads the
  playlist id from `config/site.json`).

## Dev

```bash
npm install
npm run dev      # local dev
npm run build    # static output in dist/
npm run playlist:fetch   # re-sync config/tracks.json from the playlist
```

`vite.config.js` sets `base: '/barbershop-radio/'` for GitHub Pages sub-path
deployment. Push to a GitHub repo with Pages enabled (workflow:
`.github/workflows/deploy.yml`) and it deploys on `main`.

## Notes & known limits

- Playing is YouTube iframe-based: a first user tap is required (autoplay policy),
  some videos may show ads, and mobile Safari pauses when the tab is minimized.
- Every curated video is checked for embeddability; if a track goes unavailable,
  drop it from `config/tracks.json`.
