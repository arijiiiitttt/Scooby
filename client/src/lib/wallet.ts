import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import bs58 from 'bs58'

export const DEVNET_RPC = 'https://api.devnet.solana.com'

export interface WalletProvider {
  publicKey: { toBase58(): string; toBytes(): Uint8Array }
  connect(): Promise<void>
  disconnect(): Promise<void>
  signMessage(msg: Uint8Array, encoding?: string): Promise<{ signature: Uint8Array }>
  signTransaction(tx: Transaction): Promise<Transaction>
  isConnected: boolean
}

export function getProvider(): WalletProvider | null {
  const w = window as any
  return w.solana ?? w.solflare ?? null
}

export async function connectWallet(): Promise<string> {
  const p = getProvider()
  if (!p) throw new Error('No wallet found. Install Phantom or Solflare.')
  await p.connect()
  return p.publicKey.toBase58()
}

export function signatureToBase58(bytes: Uint8Array): string {
  return bs58.encode(bytes)
}

export async function sendFeeTransaction(
  wallet: string,
  treasuryAddress: string,
  lamports: number,
): Promise<string> {
  const provider = getProvider()
  if (!provider) throw new Error('Wallet not connected')

  const connection = new Connection(DEVNET_RPC, 'confirmed')
  const fromPubkey = new PublicKey(wallet)
  const toPubkey = new PublicKey(treasuryAddress)

  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey, toPubkey, lamports }),
  )
  tx.feePayer = fromPubkey
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash

  const signed = await provider.signTransaction(tx)
  const sig = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(sig, 'confirmed')
  return sig
}
