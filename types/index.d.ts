export type Limit = { kind: string; percentUsed: number; resetsAt?: string }
export type Limits = readonly Limit[]

declare module 'claude-code' {
  interface PluginState {
    'usage-meter': { limits: Limits }
  }
}
