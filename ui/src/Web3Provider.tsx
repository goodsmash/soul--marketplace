import type { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

const queryClient = new QueryClient();
const targetChainId = Number((import.meta as any).env?.VITE_CHAIN_ID || 8453);
const activeChain = targetChainId === 84532 ? baseSepolia : base;

const config = createConfig({
  chains: [activeChain],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Soul Marketplace - OpenClaw',
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children as any}</QueryClientProvider>
    </WagmiProvider>
  );
}
