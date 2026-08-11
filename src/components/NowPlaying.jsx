export default function NowPlaying({ title, artist }) {
  return (
    <div className="now-playing">
      <h2 className="song-title" title={title}>
        {title}
      </h2>
      <p className="song-artist" title={artist}>
        {artist}
      </p>
    </div>
  )
}
