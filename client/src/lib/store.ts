import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuditReport, FeeInfo } from './api'

export type AIProvider = 'gemini' | 'claude'

type Page = 'home' | 'audit' | 'profile' | 'blog' | 'docs'
type AuditStep = 1 | 2 | 3 | 4

interface AppState {
  // nav
  page: Page
  setPage: (p: Page) => void

  // wallet
  wallet: string | null
  setWallet: (w: string | null) => void

  // auth
  feeInfo: FeeInfo | null
  setFeeInfo: (f: FeeInfo) => void

  // audit flow
  auditStep: AuditStep
  setAuditStep: (s: AuditStep) => void
  feeTxSig: string | null
  setFeeTxSig: (s: string | null) => void
  report: AuditReport | null
  setReport: (r: AuditReport | null) => void

  // AI provider settings
  aiProvider: AIProvider
  setAiProvider: (p: AIProvider) => void
  geminiApiKey: string
  setGeminiApiKey: (k: string) => void
  claudeApiKey: string
  setClaudeApiKey: (k: string) => void

  // reset audit
  resetAudit: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      page: 'home',
      setPage: (page) => set({ page }),

      wallet: null,
      setWallet: (wallet) => set({ wallet }),

      feeInfo: null,
      setFeeInfo: (feeInfo) => set({ feeInfo }),

      auditStep: 1,
      setAuditStep: (auditStep) => set({ auditStep }),

      feeTxSig: null,
      setFeeTxSig: (feeTxSig) => set({ feeTxSig }),

      report: null,
      setReport: (report) => set({ report }),

      aiProvider: 'gemini',
      setAiProvider: (aiProvider) => set({ aiProvider }),
      geminiApiKey: '',
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
      claudeApiKey: '',
      setClaudeApiKey: (claudeApiKey) => set({ claudeApiKey }),

      resetAudit: () => set({ feeTxSig: null, report: null, auditStep: 2 }),
    }),
    {
      name: 'scooby-store',
      // Persist everything except the report (it's large — fetch from DB on reload)
      partialize: (s) => ({
        page: s.page,
        wallet: s.wallet,
        feeInfo: s.feeInfo,
        auditStep: s.auditStep,
        feeTxSig: s.feeTxSig,
        aiProvider: s.aiProvider,
        geminiApiKey: s.geminiApiKey,
        claudeApiKey: s.claudeApiKey,
      }),
    }
  )
)