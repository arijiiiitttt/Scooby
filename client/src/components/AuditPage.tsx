import { useState } from 'react'
import { Wallet, CreditCard, Search, BadgeCheck, ExternalLink, Settings, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../lib/store'
import { connectWallet, getProvider, signatureToBase58, sendFeeTransaction } from '../lib/wallet'
import { api } from '../lib/api'
import { DEMO_CODE } from '../lib/demo'
import { StepIndicator, Card, SectionTitle, Btn, Alert } from './ui'
import { ReportView } from './ReportView'
import toast from 'react-hot-toast'
import { NavAudit } from './NavAudit'

const STEPS = ['Connect wallet', 'Pay fee', 'Run audit', 'Mint badge']

/* ── AI Provider Settings Panel ──────────────────── */
function AIProviderPanel() {
  const {
    aiProvider, setAiProvider,
    geminiApiKey, setGeminiApiKey,
    claudeApiKey, setClaudeApiKey,
  } = useStore()

  const [open, setOpen] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [showClaudeKey, setShowClaudeKey] = useState(false)

  const activeKey = aiProvider === 'gemini' ? geminiApiKey : claudeApiKey
  const hasKey = activeKey.trim().length > 0

  return (
    <div className="mb-5 rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:text-gray-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-gray-500" />
          <span className="font-medium">AI Provider</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            aiProvider === 'gemini'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-violet-100 text-violet-700'
          }`}>
            {aiProvider === 'gemini' ? 'Gemini' : 'Claude'}
          </span>
          {!hasKey && (
            <span className="text-xs text-amber-600">· using server key</span>
          )}
        </div>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Choose which AI model analyses your code. Your API key is sent directly to the backend for this request only — it is never stored.
          </p>

          {/* provider toggle */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Provider</p>
            <div className="flex gap-2">
              {(['gemini', 'claude'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAiProvider(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    aiProvider === p
                      ? p === 'gemini'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-violet-100 border-violet-300 text-violet-700'
                      : 'border-gray-200 text-slate-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  {p === 'gemini' ? '⚡ Gemini' : '🤖 Claude'}
                </button>
              ))}
            </div>
          </div>

          {/* API key input */}
          {aiProvider === 'gemini' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-500 font-medium">Gemini API Key</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Get free key →
                </a>
              </div>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy…"
                  className="w-full bg-white border border-gray-300 focus:border-blue-500 rounded-lg text-gray-800 text-xs font-mono p-2.5 pr-9 transition-colors"
                />
                <button
                  onClick={() => setShowGeminiKey((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                >
                  {showGeminiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Free tier: 15 req/min · 1,500/day. Hit limits? The server auto-retries with fallback models.
              </p>
            </div>
          )}

          {aiProvider === 'claude' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-500 font-medium">Claude API Key</label>
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-violet-600 hover:underline"
                >
                  Get key →
                </a>
              </div>
              <div className="relative">
                <input
                  type={showClaudeKey ? 'text' : 'password'}
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  placeholder="sk-ant-…"
                  className="w-full bg-white border border-gray-300 focus:border-violet-500 rounded-lg text-gray-800 text-xs font-mono p-2.5 pr-9 transition-colors"
                />
                <button
                  onClick={() => setShowClaudeKey((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                >
                  {showClaudeKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Requires a paid Anthropic account. Highly capable for complex smart contract analysis.
              </p>
            </div>
          )}

          {!hasKey && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-700 leading-relaxed">
              No API key entered — will use the server's configured key. Enter your own key above to avoid rate limits.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Step 1: connect ──────────────────────────────── */
function StepConnect() {
  const { setWallet, setFeeInfo, setAuditStep } = useStore()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    try {
      const pubkey = await connectWallet()
      setWallet(pubkey)
      const { message } = await api.getNonce(pubkey)
      const provider = getProvider()!
      const enc = new TextEncoder().encode(message)
      const { signature } = await provider.signMessage(enc, 'utf8')
      const sig = signatureToBase58(signature)
      const { feeInfo } = await api.verify(pubkey, sig)
      setFeeInfo(feeInfo)
      toast.success('Wallet connected')
      setAuditStep(2)
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <SectionTitle>Step 1 — Connect wallet</SectionTitle>
      <p className="text-slate-600 text-sm mb-5 leading-relaxed">
        Connect your Phantom or Solflare wallet. Signing the nonce is free — no transaction is sent at this step.
      </p>
      <Btn variant="primary" onClick={handle} loading={loading} disabled={loading}>
        <Wallet size={15} />
        Connect Phantom / Solflare
      </Btn>
    </Card>
  )
}

/* ── Step 2: pay fee ──────────────────────────────── */
function StepPayFee() {
  const { wallet, feeInfo, setFeeTxSig, setAuditStep } = useStore()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ kind: 'error' | 'success'; msg: string } | null>(null)

  async function handle() {
    if (!wallet) { toast.error('Wallet not connected'); return }
    setLoading(true)
    setStatus(null)
    try {
      const fi = feeInfo ?? await api.feeInfo()
      const sig = await sendFeeTransaction(wallet, fi.treasury, fi.amountLamports)
      setStatus({ kind: 'success', msg: `Confirmed! ${sig.slice(0, 20)}…` })
      setFeeTxSig(sig)
      setTimeout(() => setAuditStep(3), 1000)
    } catch (e: any) {
      setStatus({ kind: 'error', msg: e.message ?? 'Payment failed' })
    } finally {
      setLoading(false)
    }
  }

  const fi = feeInfo ?? { displayPrice: '0.008 SOL', savingsVsCompetitor: '45% cheaper than alternatives' }

  return (
    <Card>
      <SectionTitle>Step 2 — Pay platform fee</SectionTitle>
      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
        A one-time 0.008 SOL fee per audit covers AI inference and on-chain attestation.
      </p>

      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex-wrap gap-3">
        <div>
          <p className="font-mono text-emerald-600 text-base">{fi.displayPrice}</p>
          <p className="text-xs text-slate-500 mt-0.5">{fi.savingsVsCompetitor} · +~0.000005 SOL network fee</p>
        </div>
        <Btn variant="primary" onClick={handle} loading={loading} disabled={loading}>
          <CreditCard size={14} />
          Pay & continue
        </Btn>
      </div>

      {status && <Alert kind={status.kind}>{status.msg}</Alert>}
    </Card>
  )
}

/* ── Step 3: submit code ──────────────────────────── */
function StepSubmit() {
  const { wallet, feeTxSig, setReport, setAuditStep, aiProvider, geminiApiKey, claudeApiKey } = useStore()
  const [tab, setTab] = useState<'code' | 'programId'>('code')
  const [code, setCode] = useState('')
  const [programId, setProgramId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle() {
    setError('')
    if (!wallet || !feeTxSig) { setError('Wallet or fee missing.'); return }
    if (!code && !programId) { setError('Provide source code or a program ID.'); return }

    const activeKey = aiProvider === 'gemini' ? geminiApiKey : claudeApiKey

    setLoading(true)
    try {
      const { report } = await api.runAudit({
        wallet,
        feeTxSignature: feeTxSig,
        ...(tab === 'code' ? { code } : { programId }),
        provider: aiProvider,
        ...(activeKey.trim() ? { apiKey: activeKey.trim() } : {}),
      })
      setReport(report)
      setAuditStep(4)
    } catch (e: any) {
      setError(e.message ?? 'Audit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <SectionTitle>Step 3 — Submit code or program ID</SectionTitle>

      {/* AI provider panel */}
      <AIProviderPanel />

      {/* tabs */}
      <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit mb-5">
        {(['code', 'programId'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t 
                ? 'bg-white shadow text-gray-900' 
                : 'text-slate-600 hover:text-gray-900'
            }`}
          >
            {t === 'code' ? 'Paste code' : 'Program ID'}
          </button>
        ))}
      </div>

      {tab === 'code' ? (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your lib.rs or Anchor program code here…"
          className="w-full bg-white border border-gray-300 focus:border-violet-500 rounded-xl text-gray-800 text-xs leading-relaxed p-4 resize-y min-h-48 transition-colors"
        />
      ) : (
        <input
          type="text"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          placeholder="e.g. 3V9kdabTMdzTLudPjEP8gj5AFfRR2c8b4UyeWZMA2thT"
          className="w-full bg-white border border-gray-300 focus:border-violet-500 rounded-xl text-gray-800 text-sm p-3 transition-colors"
        />
      )}

      {error && (
        <Alert kind="error">
          {error}
          {error.toLowerCase().includes('quota') && (
            <span className="block mt-1 text-xs opacity-80">
              💡 Tip: open the AI Provider settings above and enter your own API key.
            </span>
          )}
        </Alert>
      )}

      <div className="flex gap-2 mt-4 flex-wrap">
        <Btn variant="primary" onClick={handle} loading={loading} disabled={loading}>
          <Search size={14} />
          Run audit
        </Btn>
        <Btn
          variant="ghost"
          onClick={() => { setCode(DEMO_CODE); setTab('code') }}
          disabled={loading}
        >
          Load demo code
        </Btn>
      </div>
    </Card>
  )
}

/* ── Step 4: results + badge ─────────────────────── */
function StepResults() {
  const { report, wallet, resetAudit, setAuditStep, setPage } = useStore()
  const [mintLoading, setMintLoading] = useState(false)
  const [mintResult, setMintResult] = useState<{ mint: string; explorerUrl: string } | null>(null)
  const [mintError, setMintError] = useState('')

  if (!report) return null

  async function handleMint() {
    setMintError('')
    setMintLoading(true)
    try {
      const res = await api.mintBadge(report!.id, wallet ?? undefined)
      setMintResult(res)
      setTimeout(() => { setPage('profile') }, 2500)
    } catch (e: any) {
      setMintError(e.message ?? 'Mint failed')
    } finally {
      setMintLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <ReportView report={report} />

      <Card>
        <SectionTitle>Step 4 — Mint on-chain badge</SectionTitle>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-emerald-100 border border-gray-200 flex items-center justify-center text-3xl shrink-0">
            🛡
          </div>
          <div>
            <p className="font-semibold text-gray-900">Audit Attestation Badge</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mint a Solana NFT badge proving this audit was completed, stored on-chain via the Scooby program.
            </p>
          </div>
        </div>

        {mintResult ? (
          <div>
            <Alert kind="success">
              Badge minted!{' '}
              <span className="font-mono text-xs block mt-1">{mintResult.mint}</span>
            </Alert>
            <a
              href={mintResult.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 text-xs mt-2 hover:underline"
            >
              <ExternalLink size={12} />
              View on Solana Explorer
            </a>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <Btn variant="primary" onClick={handleMint} loading={mintLoading} disabled={mintLoading}>
              <BadgeCheck size={14} />
              Mint badge
            </Btn>
            <Btn variant="ghost" onClick={() => { resetAudit(); setAuditStep(2) }}>
              New audit
            </Btn>
          </div>
        )}

        {mintError && <Alert kind="error">{mintError}</Alert>}
      </Card>
    </div>
  )
}

/* ── Audit page ───────────────────────────────────── */
export function AuditPage() {
  const { auditStep } = useStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <NavAudit />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <StepIndicator steps={STEPS} current={auditStep} />

        {auditStep === 1 && <StepConnect />}
        {auditStep === 2 && <StepPayFee />}
        {auditStep === 3 && <StepSubmit />}
        {auditStep === 4 && <StepResults />}
      </div>
    </div>
  )
}