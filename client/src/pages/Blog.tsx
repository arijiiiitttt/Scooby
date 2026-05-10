import React, { useEffect } from 'react'

const Blog: React.FC = () => {
  useEffect(() => {
    document.title = "Scooby Documentation";
  }, []);

  return (
    <>
      <div className="min-h-screen bg-white text-[#1a1a1a] selection:bg-black selection:text-white px-6 pt-16 pb-24 font-sans antialiased">
        <div className="max-w-[620px] mx-auto">

          <a href="/" className="flex justify-start mb-16">
            <img className='w-18' src="/images/logo/scooby.png" />
          </a>

          <div className="mb-12 text-[#8c8c8c] text-[15px] leading-relaxed">
            <div className="mt-8 space-y-0.5">
              <p>by: arijit.</p>
              <p>published: may 9, 2026.</p>
            </div>
          </div>

          <article className="text-[18px] leading-[1.8] tracking-[-0.011em] text-[#1a1a1a] space-y-10">
            <p>so, scooby.</p>

            <p>
              it started because smart contract security felt inaccessible. audits are
              expensive, slow, and usually impossible for small solana builders.
            </p>

            <p>
              scooby changes that. you upload your anchor files, paste your contract
              code, or enter a deployed program id. within seconds, scooby scans it
              using ai and generates a structured security report.
            </p>

            <p>
              it detects real solana-specific vulnerabilities like missing signer
              validation, unchecked ownership, authority mismatches, unsafe cpi calls,
              integer overflows, and pda seed collisions.
            </p>

            <p>
              the stack is bun and express on the backend, react and vite on the
              frontend, neondb for audit history, wallet adapter for phantom auth,
              gemini for analysis, and anchor for on-chain verification.
            </p>

            <p>
              when a user connects their wallet, scooby creates a profile and stores
              every audit permanently. users can revisit reports, track security
              history, and verify their previous scans anytime.
            </p>

            <p>
              after every successful audit, users can mint an on-chain verification
              attestation on solana proving their contract was scanned.
            </p>

            <p>
              the goal was simple: make smart contract auditing fast, affordable, and
              accessible for every builder.
            </p>

            <p>
              it is still evolving, but it works and proves that security tooling can
              be both powerful and simple.
            </p>

            <p>
              scooby is my attempt to make solana safer, one audit at a time.
            </p>
          </article>

        </div>
      </div>
    </>
  )
}

export default Blog