// Session times as members see them: 12 hour with am or pm, no leading zero,
// minutes only when they aren't on the hour. "8am", "7:30pm".
// With no timeZone it uses the browser's own zone, so it's always his time.
export function formatSessionTime(date: Date, timeZone?: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(date)

  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0)
  const minute = parts.find(p => p.type === 'minute')?.value ?? '00'
  const suffix = hour < 12 ? 'am' : 'pm'
  const hour12 = hour % 12 || 12

  return minute === '00' ? `${hour12}${suffix}` : `${hour12}:${minute}${suffix}`
}
