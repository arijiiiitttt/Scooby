import { useEffect, useState } from 'react'
import { X, ShieldCheck } from 'lucide-react'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import type { UserProfile, AuditStats, AuditHistoryItem, AuditReport } from '../lib/api'
import { Card, SectionTitle, Btn, Alert, Spinner } from './ui'
import { ReportView } from './ReportView'
import { Navbar } from './Navbar'

function scoreColor(s: number) {
  if (s >= 80) return 'text-emerald-600'
  if (s >= 60) return 'text-amber-600'
  return 'text-red-600'
}

/* ── Full-report drawer ──────────────────────────── */
function ReportDrawer({
  auditId,
  onClose,
}: {
  auditId: string
  onClose: () => void
}) {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getReport(auditId)
      .then((d) => setReport(d.report))
      .catch((e) => setError(e.message ?? 'Failed to load report'))
      .finally(() => setLoading(false))
  }, [auditId])

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* drawer panel */}
      <div className="h-full w-full max-w-2xl bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
        {/* drawer header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <p className="font-semibold text-sm text-gray-900">Audit Report</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{auditId.slice(0, 26)}…</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-slate-500 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* drawer body */}
        <div className="flex-1 px-6 py-6">
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
              <Spinner size={20} />
              <span className="text-sm">Loading report…</span>
            </div>
          )}

          {!loading && error && (
            <Alert kind="error">{error}</Alert>
          )}

          {!loading && report && (
            <ReportView report={report} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Audit row ───────────────────────────────────── */
function AuditRow({
  a,
  onClick,
}: {
  a: AuditHistoryItem
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3.5 gap-3 flex-wrap text-left hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors group"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-900 transition-colors">
          {a.program_id ? a.program_id.slice(0, 22) + '…' : 'Code audit'}
        </p>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          {a.id.slice(0, 18)}… · {new Date(a.created_at).toLocaleDateString()}
        </p>
        <p className="text-xs text-slate-600 mt-0.5">{a.ai_provider}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`font-mono text-lg font-bold w-10 text-right ${scoreColor(a.score ?? 0)}`}>
          {a.score ?? '?'}
        </span>
        <div className="w-24 flex justify-end">
          {a.badge_minted ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5 whitespace-nowrap">
              <ShieldCheck size={11} />
              badged
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 whitespace-nowrap">
              <ShieldCheck size={11} className="opacity-40" />
              not badged
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

/* ── Profile page ────────────────────────────────── */
export function ProfilePage() {
  const { wallet, setPage, setAuditStep } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [audits, setAudits] = useState<AuditHistoryItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    setError('')
    api.getProfile(wallet)
      .then((d) => {
        setUser(d.user)
        setStats(d.stats)
        setAudits(d.recentAudits ?? [])
      })
      .catch((e) => {
        if (e.message?.includes('not found') || e.message?.includes('404')) {
          setError('no_history')
        } else {
          setError(e.message ?? 'Failed to load profile')
        }
      })
      .finally(() => setLoading(false))
  }, [wallet])

  function startAudit() {
    setPage('audit')
    setAuditStep(wallet ? 2 : 1)
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <Alert kind="info">Connect your wallet to view your audit history and stats.</Alert>
        </div>
      </div>
    )
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {wallet.slice(0, 8)}…{wallet.slice(-8)}
            </p>
          </div>
          <Btn variant="primary" onClick={startAudit}>New Audit</Btn>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Spinner size={20} />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {!loading && error === 'no_history' && (
          <div className="text-center py-16">
            <p className="text-slate-600 text-sm mb-4">No audit history yet.</p>
            <Btn variant="primary" onClick={startAudit}>Run your first audit</Btn>
          </div>
        )}

        {!loading && error && error !== 'no_history' && (
          <Alert kind="error">{error}</Alert>
        )}

        {!loading && user && (
          <>
            {/* stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { val: user.total_audits ?? 0, label: 'Total audits' },
                { val: parseFloat(user.total_fees_paid ?? '0').toFixed(4), label: 'SOL paid' },
                { val: stats?.avg_score ? Math.round(stats.avg_score) : '—', label: 'Avg score' },
                { val: stats?.badges_minted ?? 0, label: 'Badges minted' },
              ].map((s) => (
                <div 
                  key={s.label} 
                  className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm"
                >
                  <span className="block font-mono text-2xl font-semibold text-gray-900">{s.val}</span>
                  <span className="text-sm text-slate-500 mt-1 block">{s.label}</span>
                </div>
              ))}
            </div>

            {/* audit list */}
            <Card>
              <SectionTitle>Recent Audits</SectionTitle>
              <p className="text-xs text-slate-600 mb-3">Click any row to view the full report</p>

              {audits.length === 0 ? (
                <p className="text-sm text-slate-600">No audits yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {audits.map((a) => (
                    <AuditRow
                      key={a.id}
                      a={a}
                      onClick={() => setSelectedId(a.id)}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* badge explanation */}
            <div className="mt-6 bg-white border border-gray-200 rounded-2xl px-5 py-5 flex gap-4">
              <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">What is a badge?</p>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                  A badge is a Solana NFT minted on-chain proving this audit was completed.
                  It acts as a verifiable certificate — anyone can check the blockchain to confirm
                  your program was audited, when, and what score it received.
                  Audits marked <span className="text-emerald-600">🛡 badged</span> have this proof on-chain.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* report drawer */}
      {selectedId && (
        <ReportDrawer
          auditId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
    </>
  )
}