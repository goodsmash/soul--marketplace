import type { ReactNode } from 'react';
import { 
  RainbowKitProvider, 
  getDefaultConfig,
  darkTheme 
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Create query client
const queryClient = new QueryClient();

// Configure RainbowKit with our contracts
const config = getDefaultConfig({
  appName: 'Soul Marketplace - OpenClaw',
  projectId: 'soul-marketplace-openclaw-v1',
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: false,
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#8b5cf6',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
          })}
          modalSize="compact"
        >
          {children as any}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
