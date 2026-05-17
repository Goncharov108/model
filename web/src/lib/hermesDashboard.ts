/** URL дашборда Hermes для iframe (прод: nginx /hermes/; dev: vite-proxy при туннеле). */
export function getHermesDashboardUrl(): string {
  if (import.meta.env.DEV) {
    return `${window.location.origin}/hermes/`
  }
  return `${window.location.origin}/hermes/`
}

/** SSH-туннель для локальной разработки без nginx на VPS. */
export const HERMES_SSH_TUNNEL_HINT =
  'ssh -N -L 9119:127.0.0.1:9119 -i ~/.ssh/id_ed25519 root@104.171.141.49'
