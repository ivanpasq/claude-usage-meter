import { expect, mock, test } from 'claude-code/testing'
import { split, tone, untilReset } from '../hooks/register'

const NOW = Date.parse('2026-10-19T12:00:00Z')

test('tempo al reset leggibile', async () => {
  expect(untilReset('2026-10-19T12:12:00Z', NOW)).toBe('12m')
  expect(untilReset('2026-10-19T14:13:00Z', NOW)).toBe('2h 13m')
  expect(untilReset('2026-10-23T21:00:00Z', NOW)).toBe('4g 9h')
  expect(untilReset(undefined, NOW)).toBeUndefined()
})

test('barra e colore seguono la percentuale', async () => {
  expect(split(50)).toEqual({ filled: '━━━━', empty: '━━━━' })
  expect(split(120).empty).toBe('')
  expect(tone(49)).toBe('success')
  expect(tone(75)).toBe('warning')
  expect(tone(95)).toBe('error')
})

const measure = async ($: any, on: any) => {
  mock.clock(on, { now: NOW })
  on('session.measure', ($: any, e: any) => ({ changed: e.changed }))
  await $.session.measure({
    context: { window: 200_000 } as never,
    rateLimits: [
      { kind: 'five_hour', percentUsed: 49, resetsAt: '2026-10-19T12:12:00Z' },
      { kind: 'seven_day', percentUsed: 19, resetsAt: '2026-10-23T21:00:00Z' },
    ],
    changed: ['rateLimits'],
  })
}

test('disegna le due finestre nel piè di pagina, su terminale e desktop', async ($, on) => {
  await measure($, on)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'usage-meter',
      surface,
      component: 'SessionMode',
      props: { modes: ['focus'] },
    })
    expect(await ui.find({ type: 'Text', text: /5h.*49%.*↻ 12m/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /7d.*19%.*↻ 4g 9h/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'focus' })).toBeDefined()
    await ui.unmount()
  }
})
