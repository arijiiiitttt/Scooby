export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Vulnerability {
  id: string
  title: string
  severity: Severity
  description: string
  location?: string
  recommendation: string
  codeSnippet?: string
}

export interface AuditReport {
  id: string
  programId?: string
  score: number
  summary: string
  vulnerabilities: Vulnerability[]
  timestamp: number
  aiProvider: string
  badgeMinted?: boolean
  badgeMint?: string
  txSignature?: string
}

export interface UserProfile {
  wallet: string
  total_audits: number
  total_fees_paid: string
  created_at: string
}

export interface AuditStats {
  avg_score: number
  badges_minted: number
  total_audits: number
}

export interface AuditHistoryItem {
  id: string
  program_id?: string
  score: number
  created_at: string
  badge_minted: boolean
  ai_provider: string
}

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

export const api = {
  health: () => req<{ status: string; provider: string; network: string }>('/health'),

  getNonce: (wallet: string) =>
    req<{ nonce: string; message: string }>(`/api/auth/nonce?wallet=${wallet}`),

  verify: (wallet: string, signature: string) =>
    req<{ user: UserProfile; feeInfo: FeeInfo }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ wallet, signature }),
    }),

  feeInfo: () => req<FeeInfo>('/api/user/fee-info'),

  runAudit: (body: {
    wallet: string
    feeTxSignature: string
    code?: string
    programId?: string
  }) => req<{ report: AuditReport }>('/api/audit', { method: 'POST', body: JSON.stringify(body) }),

  getReport: (id: string) => req<{ report: AuditReport }>(`/api/audit/${id}`),

  mintBadge: (reportId: string, recipientAddress?: string) =>
    req<{ mint: string; txSignature: string; explorerUrl: string }>('/api/badge/mint', {
      method: 'POST',
      body: JSON.stringify({ reportId, recipientAddress }),
    }),

  getProfile: (wallet: string) =>
    req<{ user: UserProfile; stats: AuditStats; recentAudits: AuditHistoryItem[] }>(
      `/api/user/profile/${wallet}`,
    ),

  getHistory: (wallet: string, limit = 20, offset = 0) =>
    req<{ audits: AuditHistoryItem[]; stats: AuditStats }>(
      `/api/user/history/${wallet}?limit=${limit}&offset=${offset}`,
    ),
}

export interface FeeInfo {
  treasury: string
  amountLamports: number
  amountSol: number
  displayPrice: string
  savingsVsCompetitor: string
}
