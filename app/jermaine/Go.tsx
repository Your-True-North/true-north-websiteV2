'use client'
import { useEffect } from 'react'

// Sends people on to the tasks page. Done in the browser (not a server
// redirect) so link-preview bots stay here and pick up the True North image.
export default function Go({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}
