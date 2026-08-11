// Central config loader. All runtime configuration lives in ../config/*.json
// so the site can be updated without touching code.
import site from '../config/site.json'
import tracks from '../config/tracks.json'

export const SITE = site
export const TRACKS = tracks
