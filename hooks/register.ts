import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: '7d' }
const BAR_WIDTH = 10

const bar = (percent: number) => {
  const filled = Math.round((Math.min(percent, 100) / 100) * BAR_WIDTH)
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)
}

const untilReset = (resetsAt: string | undefined, now: number) => {
  if (resetsAt === undefined) return ''
  const minutes = Math.max(0, Math.round((Date.parse(resetsAt) - now) / 60_000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const left = days > 0 ? `${days}g${hours}h` : `${hours}h${minutes % 60}m`
  return ` ↻${left}`
}

export const format = (limits: readonly SessionRateLimit[], now: number) => {
  const shown = limits.filter(l => l.kind in LABELS)
  if (shown.length === 0) return undefined
  return shown
    .map(l => `${LABELS[l.kind]} ${bar(l.percentUsed)} ${l.percentUsed}%${untilReset(l.resetsAt, now)}`)
    .join('  ·  ')
}

const show = async ($: EngineInterface, limits: readonly SessionRateLimit[]) =>
  $.ui.status(format(limits, await $.clock.now()))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await show($, (await $.session.usage()).rateLimits)
    return started
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) await show($, e.rateLimits)
    return next(e)
  })
}
