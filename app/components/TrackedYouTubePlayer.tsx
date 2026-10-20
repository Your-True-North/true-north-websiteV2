'use client'

import { useEffect, useRef } from 'react'

// The member video player: a YouTube embed that saves watch progress to
// /api/videos/[id]/progress, so the video shows in Carry on watching.
// Moved out of the video page so course days use the same player.
export default function TrackedYouTubePlayer({
  videoId,
  youtubeId,
  onCompleted,
}: {
  videoId: string
  youtubeId: string
  onCompleted?: () => void
}) {
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompletedRef = useRef(onCompleted)
  onCompletedRef.current = onCompleted

  useEffect(() => {
    if (!youtubeId) return

    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null
    if (!user?.id) return
    const userId = user.id

    const postProgress = (watchTimeSec: number, completed: boolean) => {
      fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, watch_time: watchTimeSec, completed })
      }).catch(() => {})
    }

    const stopInterval = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const startInterval = () => {
      stopInterval()
      intervalRef.current = setInterval(() => {
        const p = playerRef.current
        if (!p?.getCurrentTime) return
        const cur = Math.round(p.getCurrentTime())
        const dur = p.getDuration()
        if (dur > 0 && cur / dur >= 0.9) {
          stopInterval()
          postProgress(cur, true)
          onCompletedRef.current?.()
        } else {
          postProgress(cur, false)
        }
      }, 20000)
    }

    const initPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch {}
        playerRef.current = null
      }
      // Attach to the existing iframe (rendered directly in JSX)
      playerRef.current = new (window as any).YT.Player(`yt-player-${videoId}`, {
        events: {
          onReady: () => {
            // If the iframe was already playing when we attached, start tracking now
            const STATE = (window as any).YT.PlayerState
            if (playerRef.current?.getPlayerState?.() === STATE.PLAYING) {
              postProgress(Math.round(playerRef.current?.getCurrentTime?.() || 0), false)
              startInterval()
            }
          },
          onStateChange: (e: any) => {
            const STATE = (window as any).YT.PlayerState
            if (e.data === STATE.PLAYING) {
              // Save immediately on play so the video appears in Continue Watching right away
              postProgress(Math.round(playerRef.current?.getCurrentTime?.() || 0), false)
              startInterval()
            } else if (e.data === STATE.ENDED) {
              stopInterval()
              const p = playerRef.current
              postProgress(Math.round(p?.getCurrentTime?.() || 0), true)
              onCompletedRef.current?.()
            } else {
              stopInterval()
            }
          }
        }
      })
    }

    const win = window as any
    if (win.YT?.Player) {
      initPlayer()
    } else {
      const prev = win.onYouTubeIframeAPIReady
      win.onYouTubeIframeAPIReady = () => {
        if (prev) prev()
        initPlayer()
      }
      if (!document.getElementById('yt-api-script')) {
        const tag = document.createElement('script')
        tag.id = 'yt-api-script'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
    }

    return () => {
      stopInterval()
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch {}
        playerRef.current = null
      }
    }
  }, [videoId, youtubeId])

  return (
    <div style={{
      position: 'relative',
      paddingTop: '56.25%',
      background: 'var(--kyn-thumb)',
      borderRadius: 'var(--kyn-r-thumb)',
      overflow: 'hidden',
    }}>
      {youtubeId && (
        <iframe
          id={`yt-player-${videoId}`}
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  )
}
