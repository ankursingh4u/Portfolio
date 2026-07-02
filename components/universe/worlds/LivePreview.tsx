'use client'

import { useEffect, useState } from 'react'

/** A Vercel-style live preview: local video if we have it, else a live screenshot. */
export function LivePreview({
  url,
  video,
  name,
}: {
  url: string
  video?: string | null
  name: string
}) {
  const [srcIdx, setSrcIdx] = useState(0)
  const [tries, setTries] = useState(0)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState(false)
  const domain = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  const enc = encodeURIComponent(url)

  // Free, no-key live-screenshot providers, tried in order. mShots serves a
  // small "generating…" placeholder on the first hit, so we re-fetch a few
  // times until the real (full-width) screenshot is ready; if a provider fails
  // we fall through to the next, then to a clean domain card.
  const providers = [
    (n: number) => `https://s.wordpress.com/mshots/v1/${enc}?w=1000&h=750${n ? `&n=${n}` : ''}`,
    () => `https://api.microlink.io/?url=${enc}&screenshot=true&embed=screenshot.url&meta=false`,
  ]
  const shot = providers[srcIdx](tries)

  useEffect(() => {
    if (video || ready || err || srcIdx !== 0 || tries >= 4) return
    const id = setTimeout(() => setTries((t) => t + 1), 3000)
    return () => clearTimeout(id)
  }, [video, ready, err, srcIdx, tries])

  const handleError = () => {
    if (srcIdx < providers.length - 1) {
      setSrcIdx((i) => i + 1)
      setTries(0)
      setReady(false)
    } else {
      setErr(true)
    }
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-video overflow-hidden bg-[#0a0f1f]"
    >
      {/* loading shimmer until a real shot lands */}
      {!video && !ready && !err && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-white/[0.06] to-transparent">
          <span className="animate-pulse font-mono text-xs text-white/40">loading preview…</span>
        </div>
      )}

      {video ? (
        <video
          src={video}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shot}
          alt={`Live preview of ${name}`}
          loading="lazy"
          onLoad={(e) => {
            // mShots' placeholder is small; a real screenshot is ~1000px wide.
            if (srcIdx > 0 || e.currentTarget.naturalWidth >= 700) setReady(true)
          }}
          onError={handleError}
          className={`h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-[1.04] ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-white/[0.06] to-transparent">
          <span className="font-mono text-sm text-white/60">{domain}</span>
        </div>
      )}

      {/* browser-chrome dots + domain (Vercel-card feel) */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-gradient-to-b from-black/70 to-transparent px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400/70" />
        <span className="h-2 w-2 rounded-full bg-amber-400/70" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        <span className="ml-2 truncate font-mono text-[10px] text-white/70">{domain}</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8">
        <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur">
          open live ↗
        </span>
      </div>
    </a>
  )
}
