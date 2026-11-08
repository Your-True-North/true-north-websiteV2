// The public Short Fuse course (/short-fuse) opens one day at a time.
// Each Day email in Kit links to /short-fuse?k=<that day's key>, and the key
// opens that day and every day before it. Kit sends one Day email a day, so
// he can't watch the whole course in one sitting.
// The highest key he has used is kept in a cookie, so the page still opens
// his days when he comes back without the link.
export const SHORT_FUSE_KEYS = [
  'GuLR1wj_eXw', // Day 1
  'h9WdITeoJ_Y', // Day 2
  'dX9-d6bx7OI', // Day 3
  'B0iCQ76xB14', // Day 4
  'AHtfUF3cyFY', // Day 5
  '89b8x0fISnI', // Day 6
  'fCoM3MYqEgg', // Day 7
  'VOHTUMJmS_Y', // Day 8
  'zas2exjZklo', // Day 9
  'qEksgDgDOHA', // Day 10
  'r6Y3Adir6rQ', // Day 11
  '5AMz2wrulaA', // Day 12
  'WV-i0pg9AX8', // Day 13
  '0EKfcT0VfyA', // Day 14
]

export const SHORT_FUSE_COOKIE = 'sf_key'

// The day a key opens up to, or 0 for no key or an unknown one
export function dayForKey(key: unknown): number {
  if (typeof key !== 'string') return 0
  return SHORT_FUSE_KEYS.indexOf(key) + 1
}
