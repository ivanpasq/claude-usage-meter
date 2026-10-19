import { expect, mock, test } from 'claude-code/testing'
import { format } from '../hooks/register'

const NOW = Date.parse('2026-10-19T12:00:00Z')

test('mostra 5h e 7d con barra, percentuale e tempo al reset', async () => {
  const text = format(
    [
      { kind: 'five_hour', percentUsed: 27, resetsAt: '2026-10-19T14:13:00Z' },
      { kind: 'seven_day', percentUsed: 41.5, resetsAt: '2026-10-22T16:00:00Z' },
    ],
    NOW,
  )
  expect(text).toBe('5h ███░░░░░░░ 27% ↻2h13m  ·  7d ████░░░░░░ 41.5% ↻3g4h')
})

test('niente da mostrare senza finestre di abbonamento', async () => {
  expect(format([], NOW)).toBeUndefined()
  expect(format([{ kind: 'spend_limit', percentUsed: 10 }], NOW)).toBeUndefined()
})

test('session.measure aggiorna la status line', async ($, on) => {
  mock.clock(on, { now: NOW })
  on('session.measure', ($, e) => ({ changed: e.changed }))
  const seen: (string | undefined)[] = []
  on('ui.status', ($, e, next) => (seen.push(e.text), next(e)))
  await $.session.measure({
    context: { window: 200_000 } as never,
    rateLimits: [{ kind: 'five_hour', percentUsed: 90 }],
    changed: ['rateLimits'],
  })
  expect(seen.at(-1)).toBe('5h █████████░ 90%')
})
