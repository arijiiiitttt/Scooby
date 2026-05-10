import { useEffect, useState } from "react";
import { ChevronDown , ChevronRight } from "lucide-react";
import { Zap, Clock, Heart } from 'lucide-react';
import { useStore } from '../lib/store'
import { Nav } from "./Nav";

export function HomePage() {
  const { setPage, setAuditStep, wallet } = useStore()
  const [showWalletNudge, setShowWalletNudge] = useState(false);

 

  function startAudit() {
    setPage('audit')
    setAuditStep(wallet ? 2 : 1)
  }

const sections = [
    {
      title: "Product",
      links: [
        { name: "Home", path: "/" },
        { name: "Login", path: "/login" },
        { name: "Register", path: "/register" },
      ],
    },
    {
      title: "Features",
      links: [
        { name: "Traffic", path: "/" },
        { name: "Contributions", path: "/" },
        { name: "Pull requests", path: "/" },
        { name: "Issues", path: "/" },
        { name: "Profiles", path: "/dashboard" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "Contact", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Privacy", path: "/" },
        { name: "Terms", path: "/" },
      ],
    },
    {
      title: "Compare",
      links: [{ name: "GitHub Insights", path: "/" }],
    },
  ];

  const specs = [
    { label: "Audit reports", value: "Unlimited" },
    { label: "History storage", value: "Forever" },
    { label: "On-chain proofs", value: "Included" },
  ];


  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is Scooby?",
      a: "Scooby is an AI-powered smart contract auditing platform built for Solana developers to detect vulnerabilities before deployment.",
    },
    {
      q: "What kind of contracts can I audit?",
      a: "You can audit Anchor programs, Rust-based Solana smart contracts, uploaded project files, or deployed program IDs.",
    },
    {
      q: "Do I need to connect my wallet?",
      a: "Wallet connection is optional for basic audits. Connect Phantom to save reports, track audit history, and mint on-chain attestations.",
    },
    {
      q: "How long does an audit take?",
      a: "Most audits complete within 20–40 seconds depending on contract size and complexity.",
    },
    {
      q: "What vulnerabilities does Scooby detect?",
      a: "Scooby detects signer validation issues, PDA collisions, authority mismatches, unsafe CPI calls, overflow risks, and account validation flaws.",
    },
    {
      q: "How are audit results stored?",
      a: "Reports are stored in your profile history, and verified audits can be permanently attested on Solana.",
    },
    {
      q: "Is my uploaded code secure?",
      a: "Yes. Contract files are processed securely for analysis and are never publicly exposed.",
    },
    {
      q: "What happens after an audit?",
      a: "You receive a structured report with findings, severity levels, remediation guidance, and an overall security score.",
    },
    {
      q: "What is the audit fee?",
      a: "Connected wallet audits cost 0.008 SOL and include saved history plus optional on-chain verification.",
    },
    {
      q: "Why use Scooby instead of manual audits?",
      a: "Scooby provides instant, affordable first-layer security analysis, helping developers catch issues before expensive manual reviews.",
    },
  ];

  return (
    <>
     <div className="min-h-screen w-full max-w-5xl mx-auto px-6 py-20">
    
      <Nav/>

          {/* <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center bg-[#110f15] text-white/90 rounded-full py-2.5 px-2 pl-3.5 shadow-2xl border border-white/5">
              <div className="flex items-center justify-center mr-4">
                <img className="w-7 opacity-90" src="/images/logo/scoobyy.png"></img>
              </div>
              <div className="flex cursor-pointer items-center gap-4 text-[14px] font-medium mr-6">
                <a
                  href="#Features"
                  className="flex items-center gap-1 hover:text-white transition-opacity opacity-80 hover:opacity-100">
                  Features
                </a>
                <a
                  href="#Pricing"
                  className="opacity-80 hover:opacity-100 transition-opacity">
                  Pricing
                </a>
                <a
                  href="/blog"
                  className="opacity-80 hover:opacity-100 transition-opacity">
                  Blog
                </a>
                <a
                  href="/docs"
                  className="opacity-80 hover:opacity-100 transition-opacity">
                  Docs
                </a>
              </div>
              <div className="flex items-center">
                <a
                  href="/login"
                  className="text-[14px] cursor-pointer font-medium px-4 opacity-80 hover:opacity-100 transition-opacity">
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-[#8174f6] cursor-pointer hover:bg-[#7163f5] text-white text-[14px] font-semibold px-4 py-1.5 rounded-full transition-all active:scale-95 shadow-sm">
                  Register
                </a>
              </div>
            </div>
          </nav> */}
    
    
          {showWalletNudge && (
            <div
              className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#110f15] border border-[#8174f6]/30 rounded-2xl px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              style={{
                animation: "slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
              }}
            >
              <img className="w-10" src="/images/logo/scooby.png" />
              <div>
                <p className="font-semibold text-white text-sm leading-tight">Connect your wallet first!</p>
                <p className="font-mono text-[11px] text-white/50 mt-0.5">Audit and Profile pages require a connected wallet.</p>
              </div>
              <button
                onClick={() => setShowWalletNudge(false)}
                className="ml-2 text-white/30 hover:text-white/70 transition-colors text-base leading-none"
              >
                ✕
              </button>
    
              {/* Auto-dismiss progress bar */}
              <div className="absolute bottom-0 left-0 h-[2px] rounded-full bg-[#8174f6]/50"
                style={{ animation: "shrink 5000ms linear forwards" }}
              />
    
              <style>{`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(40px) scale(0.95); }
            to   { opacity: 1; transform: translateX(0)   scale(1);    }
          }
          @keyframes shrink {
            from { width: 100%; }
            to   { width: 0%;   }
          }
        `}</style>
            </div>
          )}
    
          {/* Header */}
    
          <section className="flex flex-col items-center text-center py-20 px-6 bg-white">
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-8 hover:cursor-pointer">
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase italic">New</span>
              <span className="text-indigo-600 text-sm font-medium">v1.0.0 is out! 🎈</span>
              <span className="text-indigo-300 text-sm">›</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-2xl mb-6">
            It audit contracts <br /> in seconds
            </h1>
            <p className="text-gray-500 text-lg max-w-lg mb-10 leading-relaxed">
               Audits solana contracts way faster than ever before with AI security analysis.
            </p>
            <div className="flex items-center gap-4">
              <a
               onClick={startAudit}
                className="bg-indigo-400 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-full transition-colors">
                Get started
              </a>
              <a className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-full transition-colors">
                See demo
              </a>
            </div>
          </section>

        
        {/* <Btn variant="ghost" onClick={() => setPage('profile')} className="text-base px-6 py-2.5">
          My history
        </Btn> */}
    
    
          <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
            <img
              src="/images/assets/bg.jpg"
              className="w-full h-auto min-h-[400px] object-cover block"
              alt="background waves"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10">
              <img
                src="/images/assets/dashboard.png"
                className="w-full max-w-[1150px] rounded-xl shadow-2xl border border-white/10"
                alt="dashboard preview"
              />
            </div>
          </section>
    
          <div className="max-w-6xl mx-auto mt-10 px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 p-2 rounded-full bg-indigo-50 border border-indigo-100">
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                <span className="font-bold text-gray-900">Instant audits.</span> Detect Solana smart contract vulnerabilities in seconds.
              </p>
            </div>
    
            <div className="flex flex-col items-center">
              <div className="mb-4 p-2 rounded-full bg-indigo-50 border border-indigo-100">
                <Clock className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                <span className="font-bold text-gray-900">Fast analysis.</span> Upload Anchor contracts and get reports instantly.
              </p>
            </div>
    
            <div className="flex flex-col items-center">
              <div className="mb-4 p-2 rounded-full bg-indigo-50 border border-indigo-100">
                <Heart className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                <span className="font-bold text-gray-900">Built for devs.</span> Secure your Solana programs before deploying to mainnet.
              </p>
            </div>
          </div>
    
          <section id="Features" className="flex flex-col items-center justify-center py-20 px-4 text-center mt-10 bg-white">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-medium text-gray-500 bg-gray-100 rounded-md">
              Features
            </span>
            <h2 className="max-w-2xl mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Everything you need to <br /> secure Solana contracts
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-gray-500">
              AI-powered smart contract auditing built for developers shipping on Solana.
            </p>
    
            <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-6">
    
              {/* Card 1 */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="p-8 text-center bg-gray-50">
                  <span className="text-purple-500 font-medium text-sm block mb-3">01</span>
                  <h3 className="text-gray-900 font-bold mb-2">
                    Upload Contract. <span className="text-gray-500 font-bold">Submit your Anchor smart contract files for instant analysis.</span>
                  </h3>
                </div>
              </div>
    
              {/* Card 2 */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="p-8 text-center bg-gray-50">
                  <span className="text-purple-500 font-medium text-sm block mb-3">02</span>
                  <h3 className="text-gray-900 font-bold mb-2">
                    AI Audit. <span className="text-gray-500 font-bold">Scooby scans for vulnerabilities, unsafe logic, and common Solana security risks.</span>
                  </h3>
                </div>
              </div>
    
              {/* Card 3 */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="p-8 text-center bg-gray-50">
                  <span className="text-purple-500 font-medium text-sm block mb-3">03</span>
                  <h3 className="text-gray-900 font-bold mb-2">
                    Fix Fast. <span className="text-gray-500 font-bold">Get detailed reports with suggestions to patch issues before deployment.</span>
                  </h3>
                </div>
              </div>
    
            </div>
          </section>
    
    
    
          {/* Pricing */}
          <section id="Pricing" className="flex flex-col items-center text-center py-12 px-6 bg-white mt-2 mb-8 max-w-sm mx-auto">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-medium text-gray-500 bg-gray-100 rounded-md">
              Pricing
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight"> Affordable security</h2>
            <p className="text-gray-400 text-sm mb-8 leading-snug">
              Instant smart contract audits for every Solana builder.
            </p>
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2">
                <span className="text-md text-gray-300 line-through">0.0145 SOL</span>
                <span className="text-2xl font-bold text-gray-900">0.008 SOL</span>
              </div>
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-1">Per audit</p>
            </div>
            <div className="w-full bg-gray-50 rounded-xl overflow-hidden mb-6 border border-gray-100">
              {specs.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-3 border-b last:border-b-0 border-gray-200/50"
                >
                  <span className="text-gray-900 font-medium text-xs">{item.label}</span>
                  <span className="text-gray-500 text-xs">{item.value}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white cursor-alias text-sm font-bold py-3 rounded-full transition-all shadow-md shadow-indigo-100">
              Start now to run
            </button>
            <p className="text-gray-400 text-[10px] mt-3 ">Pay only when you audit</p>
          </section>
    
          {/* FAQ Section */}
    
          <section className="w-full max-w-xl mx-auto px-6 py-26 flex flex-col items-center">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-medium text-gray-500 bg-gray-100 rounded-md">
              FAQ
            </span>
            <h2 className="text-[40px] font-bold text-[#121212] leading-tight mb-4 text-center">
              Frequently <br /> asked questions
            </h2>
            <p className="text-slate-500 text-sm text-center max-w-sm mb-10">
              Quick answers to common questions about pricing, privacy, setup, and
              more.
            </p>
            <div className="w-full space-y-1">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl transition-all duration-200 hover:bg-gray-200 ${isOpen ? "bg-gray-100" : "bg-gray-100"}`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between py-4 px-5 text-left"
                    >
                      <span
                        className={`text-[14.5px] font-bold transition-colors ${isOpen ? "text-[#121212]" : "text-[#444]"}`}
                      >
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-indigo-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                      <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-slate-500 font-medium max-w-[90%]">
                        {faq.a}
                      </p>
                    </div>
                    {!isOpen && index !== faqs.length - 1 && (
                      <div className="mx-5 h-[1px] bg-slate-100" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
    
          <div className="bg-[#f9f9fb] rounded-[32px] py-12 px-6 flex flex-col items-center text-center border border-slate-100">
            <h2 className="text-[38px] font-bold text-[#121212] leading-tight mb-4 tracking-tight">
              Secure your contracts <br /> before deployment
            </h2>
    
            <p className="text-[#666666] text-[16px] max-w-sm leading-relaxed mb-10">
              Run instant AI-powered Solana smart contract audits and deploy with confidence.
            </p>
    
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="bg-[#8b8df8] hover:bg-[#7a7cf2] text-white font-semibold px-7 py-3 rounded-full text-[15px] transition-all shadow-sm active:scale-95">
                Run Audit
              </a>
    
              <a
                href="/"
                className="bg-[#f2f2f2] hover:bg-[#e8e8e8] text-[#555555] font-semibold px-7 py-3 rounded-full text-[15px] transition-all active:scale-95">
                View Demo
              </a>
            </div>
          </div>
    
          {/* Footer */}
          <footer className="bg-white py-16 mt-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
              <div className="max-w-xs">
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Your repos have a story. See it in traffic, stars, commits, and contributors, all in one place.
                </p>
                <span className="text-gray-400 text-sm">© 2026</span>
              </div>
    
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-16">
                {sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-gray-900 font-bold text-sm mb-4">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.path}
                            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </footer>
        </div>
        </>
  )
}
