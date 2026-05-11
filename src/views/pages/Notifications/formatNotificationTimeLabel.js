/**
 * One-shot label for a notification's created time (call only when mapping API data).
 * Uses createdAt vs "now" at format time — do not re-run on re-render for the same row.
 */
export function formatNotificationTimeLabel(createdAtRaw) {
  if (createdAtRaw == null || createdAtRaw === '') return '—'
  const then = new Date(createdAtRaw)
  if (Number.isNaN(then.getTime())) return '—'

  const now = Date.now()
  const diffMs = Math.max(0, now - then.getTime())
  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hrs = Math.floor(min / 60)
  const days = Math.floor(hrs / 24)

  if (sec < 60) return 'Just now'
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`

  const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate())
  const startOfNow = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const dayDiff = Math.round((startOfNow - startOfThen) / (24 * 60 * 60 * 1000))

  if (dayDiff === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return then.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
