# usage-meter

Una mod per Claude Code che mostra, sotto il prompt, quanto hai usato della finestra di **5 ore** e di quella **settimanale** del tuo abbonamento Claude, e tra quanto si azzerano.

```
5h ███░░░░░░░ 27% ↻2h13m  ·  7d ████░░░░░░ 41.5% ↻3g4h
```

- Si aggiorna da sola quando una delle due percentuali sale di almeno un punto.
- I dati arrivano con le risposte del modello: la riga compare dopo il primo messaggio della sessione.
- Senza un abbonamento Claude (per esempio con una API key) quei dati non ci sono e la riga non appare.

## Installazione

Al prompt di una sessione di Claude Code nel terminale:

```
/plugin install usage-meter --marketplace ivanpasq/claude-usage-meter
```

Da shell:

```bash
claude plugin install usage-meter --marketplace ivanpasq/claude-usage-meter
```

Nell'app desktop, dove `/plugin` non è disponibile: clicca **+** accanto al box del prompt, poi **Plugins**, **Add marketplace** con `ivanpasq/claude-usage-meter`, poi **Add plugin**.

## Disinstallazione

```bash
claude plugin uninstall usage-meter
```

## Licenza

MIT
