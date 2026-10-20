# usage-meter

A Claude Code mod that shows, in the prompt footer, how much of your Claude subscription's **5-hour** and **weekly** windows you have used, and how long until each one resets.

```
5h ━━━━━━━━ 49% ↻ 12m   7d ━━━━━━━━ 19% ↻ 4d 9h
```

The bar is green up to 70%, yellow up to 90%, and red beyond that. The time until reset refreshes every minute.

- Terminal only: the desktop app already shows usage next to the model picker.
- Updates by itself whenever either percentage rises by at least one point.
- The figures arrive with the model's responses, so the line appears after the session's first message.
- Without a Claude subscription (for example, with an API key) those figures are not available and the line does not appear.

## Install

At the prompt of a Claude Code session in the terminal:

```
/plugin install usage-meter --marketplace ivanpasq/claude-usage-meter
```

From a shell:

```bash
claude plugin install usage-meter --marketplace ivanpasq/claude-usage-meter
```

In the desktop app, where `/plugin` is not available: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `ivanpasq/claude-usage-meter`, then **Add plugin**.

## Update

```bash
claude plugin update usage-meter@claude-usage-meter
```

## Uninstall

```bash
claude plugin uninstall usage-meter
```

## License

MIT
