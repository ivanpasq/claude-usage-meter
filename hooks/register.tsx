import { atom, read, update } from 'claude-code'
import type { Color, Register } from 'claude-code'

import type { Limits } from '../types'

const limits = atom({ plugin: 'usage-meter', key: 'limits' } as const, [] as Limits)

const WINDOWS = [
  { kind: 'five_hour', label: '5h' },
  { kind: 'seven_day', label: '7d' },
] as const
const BAR_WIDTH = 8
const MINUTE = 60_000

export const tone = (percent: number): Color =>
  percent >= 90 ? 'error' : percent >= 70 ? 'warning' : 'success'

export const split = (percent: number) => {
  const filled = Math.round((Math.min(Math.max(percent, 0), 100) / 100) * BAR_WIDTH)
  return { filled: '━'.repeat(filled), empty: '━'.repeat(BAR_WIDTH - filled) }
}

export const untilReset = (resetsAt: string | undefined, now: number) => {
  if (resetsAt === undefined) return undefined
  const minutes = Math.max(0, Math.round((Date.parse(resetsAt) - now) / MINUTE))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0) return `${days}g ${hours}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    $.ui.status(undefined)
    const usage = await $.session.usage()
    await update($, limits, () => usage.rateLimits)
    $.clock.every(MINUTE, () => $.ui.invalidate('ui.render'))
    return started
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) await update($, limits, () => e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const current = await read($, limits)
    const shown = WINDOWS.flatMap(w => {
      const limit = current.find(l => l.kind === w.kind)
      return limit === undefined ? [] : [{ ...w, limit }]
    })
    if (shown.length === 0) return next(e)

    const now = await $.clock.now()
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box key="usage-meter" flexDirection="row" gap={2}>
        {shown.map(({ kind, label, limit }) => {
          const color = tone(limit.percentUsed)
          const bar = split(limit.percentUsed)
          const reset = untilReset(limit.resetsAt, now)
          return (
            <Text key={kind} wrap="truncate-end">
              <Text dimColor>{label} </Text>
              <Text color={color}>{bar.filled}</Text>
              <Text color="subtle">{bar.empty}</Text>
              <Text color={color} weight="bold" tabular>
                {' '}
                {limit.percentUsed}%
              </Text>
              {reset === undefined ? null : <Text dimColor> ↻ {reset}</Text>}
            </Text>
          )
        })}
        {e.props.modes.length > 0 ? <Text dimColor>{e.props.modes.join(' & ')}</Text> : null}
      </Box>
    )
  })
}
