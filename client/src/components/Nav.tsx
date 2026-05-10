import { Wallet } from 'lucide-react';
import { useStore } from '../lib/store';
import { connectWallet, getProvider, signatureToBase58 } from '../lib/wallet';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export function Nav() {
  const { wallet, setWallet, setFeeInfo, setPage, page, setAuditStep } = useStore();

  async function handleConnect() {
    try {
      const pubkey = await connectWallet();
      setWallet(pubkey);

      const { message } = await api.getNonce(pubkey);
      const provider = getProvider()!;
      const enc = new TextEncoder().encode(message);
      const { signature } = await provider.signMessage(enc, 'utf8');
      const sig = signatureToBase58(signature);

      const { feeInfo } = await api.verify(pubkey, sig);
      setFeeInfo(feeInfo);

      toast.success('Wallet connected successfully');

      setPage('audit');
      setAuditStep(2);

    } catch (e: any) {
      toast.error(e.message ?? 'Connection failed');
    }
  }

  function handleDisconnect() {
    const p = getProvider();
    p?.disconnect().catch(() => {});
    setWallet(null);
    toast('Wallet disconnected');
  }

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center bg-[#110f15] text-white/90 rounded-full py-2.5 px-2 pl-3.5 shadow-2xl border border-white/5">
        
        {/* Logo */}
        <div className="flex items-center justify-center mr-4">
          <img 
            className="w-7 opacity-90" 
            src="/images/logo/scoobyy.png" 
            alt="scooby" 
          />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 text-[14px] font-medium mr-6">
          <button
            onClick={() => setPage('audit')}
            className={`transition-opacity hover:text-white 
              ${page === 'audit' ? 'text-white' : 'opacity-80 hover:opacity-100'}`}
          >
            Audit
          </button>

          <a
            href="/blog"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            Blog
          </a>
          <a
            href="/docs"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            Docs
          </a>

          {wallet && (
            <button
              onClick={() => setPage('profile')}
              className={`flex items-center gap-1.5 transition-opacity hover:text-white 
                ${page === 'profile' ? 'text-white' : 'opacity-80 hover:opacity-100'}`}
            >
              Profile
            </button>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center">
          {wallet ? (
            <button
              onClick={handleDisconnect}
              className="text-xs font-medium px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors border border-white/10"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 bg-[#8174f6] hover:bg-[#7163f5] text-white text-[14px] font-semibold px-5 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}