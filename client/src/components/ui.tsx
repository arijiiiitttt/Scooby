import React from 'react'
import { Loader2 } from 'lucide-react'

/* ── Spinner ──────────────────────────────────────── */
export function Spinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" />
}

/* ── Badge ────────────────────────────────────────── */
const sevStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  high:     'bg-amber-100 text-amber-700 border border-amber-200',
  medium:   'bg-violet-100 text-violet-700 border border-violet-200',
  low:      'bg-emerald-100 text-emerald-700 border border-emerald-200',
  info:     'bg-gray-100 text-gray-600 border border-gray-200',
}

export function SevBadge({ sev }: { sev: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase font-mono shrink-0 ${sevStyles[sev] ?? sevStyles.info}`}>
      {sev}
    </span>
  )
}

/* ── Score ring ───────────────────────────────────── */
export function ScoreRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl leading-none font-semibold" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] text-slate-500">/100</span>
      </div>
    </div>
  )
}

/* ── Step indicator ───────────────────────────────── */
export function StepIndicator({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-2 text-sm ${done ? 'text-emerald-600' : active ? 'text-violet-600' : 'text-slate-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] border shrink-0
                ${done 
                  ? 'border-emerald-600 bg-emerald-100 text-emerald-600' 
                  : active 
                  ? 'border-violet-600 bg-violet-100 text-violet-600' 
                  : 'border-gray-300 text-slate-500 bg-white'}`}>
                {done ? '✓' : n}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mx-2 shrink-0 ${n < current ? 'bg-emerald-200' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ── Card ─────────────────────────────────────────── */
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

/* ── Section title ────────────────────────────────── */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-4">
      {children}
    </p>
  )
}

/* ── Alert ────────────────────────────────────────── */
type AlertKind = 'error' | 'success' | 'info'
const alertStyles: Record<AlertKind, string> = {
  error:   'bg-red-50 border-red-200 text-red-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  info:    'bg-violet-50 border-violet-200 text-violet-700',
}

export function Alert({ kind, children }: { kind: AlertKind; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm border mt-3 ${alertStyles[kind]}`}>
      {children}
    </div>
  )
}

/* ── Button ───────────────────────────────────────── */
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'teal'
  loading?: boolean
}

const btnStyles: Record<string, string> = {
  primary: 'bg-violet-600 hover:bg-violet-700 text-white border-violet-600 shadow-sm',
  ghost:   'bg-white hover:bg-gray-50 border-gray-300 text-gray-700',
  teal:    'bg-emerald-100 hover:bg-emerald-200 border-emerald-200 text-emerald-700',
}

export function Btn({ 
  variant = 'ghost', 
  loading, 
  children, 
  className = '', 
  ...props 
}: BtnProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${btnStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}