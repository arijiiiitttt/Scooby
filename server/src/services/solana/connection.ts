import { Connection, clusterApiUrl } from "@solana/web3.js";

const network = process.env.SOLANA_NETWORK ?? "devnet";
const heliusKey = process.env.HELIUS_API_KEY;

function getRpcUrl(): string {
  if (heliusKey && heliusKey !== "your_helius_api_key_here") {
    const cluster = network === "mainnet-beta" ? "mainnet" : "devnet";
    return `https://${cluster}.helius-rpc.com/?api-key=${heliusKey}`;
  }
  // Fallback to public devnet
  return clusterApiUrl("devnet");
}

export const connection = new Connection(getRpcUrl(), "confirmed");
export { network };
