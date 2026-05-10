export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  location?: string;
  recommendation: string;
  codeSnippet?: string;
}

export interface AuditReport {
  id: string;
  programId?: string;
  score: number; // 0–100
  summary: string;
  vulnerabilities: Vulnerability[];
  timestamp: number;
  aiProvider: string;
  badgeMinted?: boolean;
  badgeMint?: string;
  txSignature?: string;
}

export interface AuditRequest {
  programId?: string;
  code?: string;
}

export type AIProvider = "claude" | "gemini";
