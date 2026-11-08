'use client'

import { useEffect } from 'react'
import { SHORT_FUSE_COOKIE } from '../../../lib/shortfuse-days'

// Remembers the furthest day's key from his email link, so the page still
// opens his days when he comes back without the link. Kept for 90 days.
export default function SaveKey({ shortFuseKey }: { shortFuseKey: string }) {
  useEffect(() => {
    try {
      document.cookie = `${SHORT_FUSE_COOKIE}=${encodeURIComponent(shortFuseKey)}; path=/short-fuse; max-age=${60 * 60 * 24 * 90}; samesite=lax`
    } catch {}
  }, [shortFuseKey])
  return null
}
