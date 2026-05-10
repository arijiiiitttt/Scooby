
import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { useStore } from "../lib/store";

type PageId =
  | "overview"
  | "how-it-works"
  | "tech-stack"
  | "api"
  | "database"
  | "setup";

interface NavItem {
  id: PageId;
  label: string;
  group: string;
}

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", group: "Introduction" },
  { id: "how-it-works", label: "How It Works", group: "Introduction" },
  { id: "tech-stack", label: "Tech Stack", group: "Reference" },
  { id: "api", label: "API Endpoints", group: "Reference" },
  { id: "database", label: "Database", group: "Reference" },
  { id: "setup", label: "Local Setup", group: "Reference" },
];

const H1: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0f0f0f] mb-3 leading-tight">
    {children}
  </h1>
);

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#0f0f0f] mt-10 mb-3">
    {children}
  </h2>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[15px] leading-[1.75] text-[#444] mb-4">{children}</p>
);



const Block: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="bg-[#f8f8f8] text-black font-sans text-[13px] leading-[1.7] rounded-lg px-5 py-4 overflow-x-auto my-4 whitespace-pre-wrap">
    {children}
  </pre>
);



const Divider = () => <hr className="border-[#ebebeb] my-8" />;

const OverviewPage = () => (
  <div>
    <H1>Scooby</H1>
    <p className="text-[15px] text-[#888] mb-8 leading-relaxed">
      Instant Anchor smart contract analysis. Upload once, get deep insights instantly.
    </p>
    <P>
      Scooby is an intelligent analysis tool for Solana Anchor programs. Just upload your 
      smart contract files and receive instant security reports, code quality scores, 
      vulnerability detection, and detailed explanations.
    </P>
    <P>
      Built for Solana developers who want to ship safer contracts faster — with the help 
      of everyone’s favorite detective dog.
    </P>

    <Divider />
    <H2>Three core capabilities</H2>
    <P>The platform runs three specialized engines working together:</P>
    <div className="grid grid-cols-1 gap-3 my-4">
      {[
        { name: "Static Analyzer", desc: "Parses your Rust + Anchor code and detects security patterns and common pitfalls." },
        { name: "AI Reviewer", desc: "Provides human-readable explanations and improvement suggestions." },
        { name: "Report Generator", desc: "Delivers clean, visual reports with risk scores and highlighted issues." },
      ].map((p) => (
        <div key={p.name} className="border border-[#ebebeb] rounded-lg px-4 py-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[14px] font-semibold text-[#0f0f0f]">{p.name}</span>
          </div>
          <p className="text-[14px] text-[#666] leading-relaxed">{p.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const HowItWorksPage = () => (
  <div>
    <H1>How It Works</H1>
    <p className="text-[15px] text-[#888] mb-8">
      From upload to actionable insights — step by step.
    </p>
    {[
      {
        step: "01",
        title: "You upload your contract",
        body: "Drag & drop your Anchor files (lib.rs, Cargo.toml, etc.) or select them manually.",
        code: `POST /api/analyze\n{\n  "files": [...]\n}`,
      },
      {
        step: "02",
        title: "Static Analysis Engine",
        body: "Scooby parses your code, checks account validation, PDA seeds, access control, and common Anchor security patterns.",
        code: `Analyzes: ownership, signer checks, bump seeds, reentrancy risks...`,
      },
      {
        step: "03",
        title: "AI-Powered Review",
        body: "The system generates clear explanations and suggests improvements using advanced code understanding.",
        code: `→ "Consider adding a proper access control check here"`,
      },
      {
        step: "04",
        title: "Report Delivered",
        body: "You receive a detailed report with risk scores, highlighted issues, and best practice recommendations.",
        code: `Risk Score: 92/100\nIssues Found: 3\nSuggestions: 7`,
      },
    ].map(({ step, title, body, code }) => (
      <div key={step} className="mb-10">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-[12px] font-mono text-[#bbb]">{step}</span>
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#0f0f0f]">{title}</h2>
        </div>
        <P>{body}</P>
        <Block>{code}</Block>
      </div>
    ))}
  </div>
);

const TechStackPage = () => (
  <div>
    <H1>Tech Stack</H1>
    <p className="text-[15px] text-[#888] mb-8">Modern tools that power Scooby.</p>
    
    <H2>Frontend</H2>
    {[
      { name: "React + TypeScript", why: "Fast, type-safe UI with excellent developer experience." },
      { name: "Tailwind CSS", why: "Utility-first styling for beautiful, responsive design." },
      { name: "Vite", why: "Lightning fast build tool and development server." },
    ].map(({ name, why }) => (
      <div key={name} className="flex gap-4 py-3 border-b border-[#f0f0f0] last:border-0">
        <span className="text-[14px] font-semibold text-[#0f0f0f] w-36 shrink-0">{name}</span>
        <span className="text-[14px] text-[#555] leading-relaxed">{why}</span>
      </div>
    ))}

    <H2>Backend & Analysis</H2>
    {[
      { name: "Bun / Node.js", why: "High performance JavaScript runtime." },
      { name: "Rust + Anchor", why: "Deep understanding of Solana programs." },
      { name: "LLM Analysis", why: "Intelligent code review and natural language explanations." },
      { name: "PostgreSQL", why: "Reliable storage for analysis history and user data." },
    ].map(({ name, why }) => (
      <div key={name} className="flex gap-4 py-3 border-b border-[#f0f0f0] last:border-0">
        <span className="text-[14px] font-semibold text-[#0f0f0f] w-36 shrink-0">{name}</span>
        <span className="text-[14px] text-[#555] leading-relaxed">{why}</span>
      </div>
    ))}
  </div>
);

// Keep the rest of your original pages (ApiPage, DatabasePage, SetupPage) 
// or update them similarly. For now, I'm keeping them as placeholders:

const ApiPage = () => <div className="py-8"><H1>API Endpoints</H1><p className="text-[#888]">API documentation coming soon...</p></div>;
const DatabasePage = () => <div className="py-8"><H1>Database</H1><p className="text-[#888]">Database schema documentation coming soon...</p></div>;
const SetupPage = () => <div className="py-8"><H1>Local Setup</H1><p className="text-[#888]">Setup guide coming soon...</p></div>;

const PAGES: Record<PageId, React.FC> = {
  "overview": OverviewPage,
  "how-it-works": HowItWorksPage,
  "tech-stack": TechStackPage,
  "api": ApiPage,
  "database": DatabasePage,
  "setup": SetupPage,
};

const Docs: React.FC = () => {
  const [current, setCurrent] = useState<PageId>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const PageComponent = PAGES[current];
  const groups = [...new Set(NAV.map((n) => n.group))];

  useEffect(() => {
    const item = NAV.find((n) => n.id === current);
    document.title = item ? `${item.label} — Scooby` : "Scooby Docs";
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [current]);
  
  const { setPage } = useStore();

  return (
    <>
    <div className="min-h-screen bg-white text-[#1a1a1a] antialiased">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#ebebeb]">
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">
           <button
            onClick={() => setPage('home')}
            className="cursor-pointer"
           >
           <img src="/images/logo/scooby.png" className="w-10" />
           </button>
            </span>
            <span className="text-[16px] font-semibold text-[#0f0f0f]">Scooby</span>
            <span className="text-[11px] font-semibold text-[#888]">docs</span>
          </a>
          <button
            className="md:hidden text-[#888] hover:text-[#0f0f0f] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-6 flex gap-0 relative">
        <aside className={`
          md:block md:sticky md:top-14 md:h-[calc(100vh-56px)] md:w-52 md:shrink-0
          ${menuOpen ? "block" : "hidden"}
          fixed top-14 left-0 right-0 z-30 bg-white border-b md:border-b-0 border-[#ebebeb]
          md:border-r md:border-r-[#ebebeb]
          py-8 md:pr-6 px-6 md:px-0 overflow-y-auto
        `}>
          {groups.map((group) => (
            <div key={group} className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#bbb] mb-2 px-0">
                {group}
              </p>
              <ul className="space-y-0.5">
                {NAV.filter((n) => n.group === group).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrent(item.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-[14px] transition-colors ${current === item.id
                          ? "bg-[#f0f0f0] text-[#0f0f0f] font-medium"
                          : "text-[#666] hover:text-[#0f0f0f] hover:bg-[#f8f8f8]"
                        }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="flex-1 min-w-0 py-12 md:pl-12 max-w-[640px]">
          <PageComponent />
          {/* Prev / Next Navigation - unchanged */}
          <div className="flex justify-between mt-16 pt-8 border-t border-[#ebebeb]">
            {(() => {
              const idx = NAV.findIndex((n) => n.id === current);
              const prev = NAV[idx - 1];
              const next = NAV[idx + 1];
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => setCurrent(prev.id)}
                      className="flex flex-col items-start text-left group"
                    >
                      <span className="text-[11px] text-[#bbb] uppercase tracking-wider mb-1">Previous</span>
                      <span className="text-[14px] text-[#555] group-hover:text-[#0f0f0f] transition-colors">
                        ← {prev.label}
                      </span>
                    </button>
                  ) : <div />}
                  {next ? (
                    <button
                      onClick={() => setCurrent(next.id)}
                      className="flex flex-col items-end text-right group"
                    >
                      <span className="text-[11px] text-[#bbb] uppercase tracking-wider mb-1">Next</span>
                      <span className="text-[14px] text-[#555] group-hover:text-[#0f0f0f] transition-colors">
                        {next.label} →
                      </span>
                    </button>
                  ) : <div />}
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Docs;