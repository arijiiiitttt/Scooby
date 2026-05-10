import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { AuditReport, Vulnerability } from '../lib/api'
import { ScoreRing, SevBadge, Card, SectionTitle } from './ui'

function VulnCard({ v }: { v: Vulnerability }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl px-5 py-4 cursor-pointer transition-all duration-200 hover:shadow-sm"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center gap-4">
        <SevBadge sev={v.severity} />
        
        <span className="flex-1 text-[15px] font-medium text-gray-900 leading-tight">
          {v.title}
        </span>

        {v.location && (
          <span className="hidden sm:block text-xs text-slate-500 font-mono bg-gray-100 px-2.5 py-1 rounded-md">
            {v.location}
          </span>
        )}

        <div className="text-slate-400">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-[14.5px] text-slate-600 leading-relaxed">
          <p>{v.description}</p>
          
          {v.codeSnippet && (
            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
              {v.codeSnippet}
            </pre>
          )}
          
          <p className="text-emerald-600 font-medium flex items-start gap-1.5">
            ↳ <span>{v.recommendation}</span>
          </p>
        </div>
      )}
    </div>
  )
}

const SEV_ORDER = ['critical', 'high', 'medium', 'low', 'info'] as const

export function ReportView({ report }: { report: AuditReport }) {
  const vulns = report.vulnerabilities ?? []
  const counts = Object.fromEntries(SEV_ORDER.map((s) => [s, 0]))
  vulns.forEach((v) => { counts[v.severity] = (counts[v.severity] ?? 0) + 1 })

  const sorted = [...vulns].sort(
    (a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity),
  )

  return (
    <Card>
      {/* Header */}
      <div className="flex items-start gap-6 mb-6 flex-wrap">
        <ScoreRing score={report.score} />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900">Audit Report</h2>
          <p className="text-sm text-slate-600 mt-1">
            Provider: {report.aiProvider} · {new Date(report.timestamp).toLocaleString()}
          </p>
          {report.programId && (
            <p className="text-xs text-slate-500 font-mono mt-2 bg-gray-100 inline-block px-3 py-1 rounded-lg">
              {report.programId}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="text-[15px] text-slate-700 leading-relaxed bg-gray-50 border-l-4 border-violet-500 rounded-r-2xl px-5 py-4 mb-6">
        {report.summary}
      </div>

      {/* Severity Counts */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SEV_ORDER.filter((s) => counts[s] > 0).map((s) => (
          <SevBadge key={s} sev={`${counts[s]} ${s}`} />
        ))}
        {vulns.length === 0 && (
          <span className="text-lg text-emerald-600 font-medium">No issues found 🎉</span>
        )}
      </div>

      {/* Vulnerabilities */}
      <SectionTitle>
        {vulns.length} Finding{vulns.length !== 1 ? 's' : ''}
      </SectionTitle>

      <div className="space-y-3">
        {sorted.map((v) => (
          <VulnCard key={v.id} v={v} />
        ))}
        
        {vulns.length === 0 && (
          <p className="text-slate-600 py-8 text-center">
            No vulnerabilities detected in this audit.
          </p>
        )}
      </div>
    </Card>
  )
}