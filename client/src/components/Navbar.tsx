import { Wallet, User } from 'lucide-react';
import { useStore } from '../lib/store';
import { connectWallet, getProvider, signatureToBase58 } from '../lib/wallet';
import { api } from '../lib/api';
import { Btn } from './ui';
import toast from 'react-hot-toast';

export function Navbar() {
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

      if (page === 'audit') setAuditStep(2);
    } catch (e: any) {
      toast.error(e.message ?? 'Connection failed');
    }
  }

  function handleDisconnect() {
    const p = getProvider();
    p?.disconnect().catch(() => {});
    setWallet(null);
    toast('Disconnected');
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-8 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      
      {/* Logo */}
      <button
        className="font-mono text-xl font-semibold tracking-tighter flex items-center gap-2 text-gray-900 hover:text-emerald-600 transition-colors"
        onClick={() => setPage('home')}
      >
        <span className="w-2.5 h-2.5 rounded-ful inline-block" />
        scooby
      </button>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {wallet && (
          <button
            onClick={() => setPage('audit')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100"
          >
            <User size={18} />
            Audit
          </button>
        )}

        {wallet ? (
          <Btn 
            variant="ghost" 
            onClick={handleDisconnect}
            className="text-sm px-5 py-2 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            Disconnect
          </Btn>
        ) : (
          <Btn 
            variant="teal" 
            onClick={handleConnect}
            className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5"
          >
            <Wallet size={18} />
            Connect Wallet
          </Btn>
        )}
      </div>
    </nav>
  );
}