import { useReadContract, useWriteContract, useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { SOUL_TOKEN_ABI, MARKETPLACE_ABI } from '../types';
import type { SoulListing } from '../types';

// V2 contracts only
const SOUL_V2 = '0x6e338A946275b0E949faCF6f8c5A93F93684A1e0' as `0x${string}`;
const MARKET_V2 = '0x72bc374Bdb5Dd162635c2e5492f001210E2317a8' as `0x${string}`;

// Hook to get mint fee
export function useMintFee() {
  const { data, isLoading, error } = useReadContract({
    address: SOUL_V2,
    abi: SOUL_TOKEN_ABI,
    functionName: 'mintFee',
  });

  return {
    mintFee: data ? formatEther(data as bigint) : '0.00001',
    isLoading,
    error
  };
}

// Hook to check if user has a soul
export function useHasSoul(address?: string) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  const soulIdQuery = useReadContract({
    address: SOUL_V2,
    abi: SOUL_TOKEN_ABI,
    functionName: 'agentToSoul',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    query: { enabled: !!targetAddress }
  });

  const balanceQuery = useReadContract({
    address: SOUL_V2,
    abi: SOUL_TOKEN_ABI,
    functionName: 'balanceOf',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    query: { enabled: !!targetAddress }
  });

  const soulId = soulIdQuery.data !== undefined ? Number(soulIdQuery.data as bigint) : 0;
  const balance = balanceQuery.data !== undefined ? Number(balanceQuery.data as bigint) : 0;

  return {
    hasSoul: balance > 0,
    soulId,
    balance,
    isLoading: soulIdQuery.isLoading || balanceQuery.isLoading,
    error: soulIdQuery.error || balanceQuery.error
  };
}

// Hook to get soul details
export function useSoulDetails(soulId: number, enabled: boolean = true) {
  const canQuery = enabled && soulId >= 0;

  const { data, isLoading, error } = useReadContract({
    address: SOUL_V2,
    abi: SOUL_TOKEN_ABI,
    functionName: 'souls',
    args: canQuery ? [BigInt(soulId)] : undefined,
    query: { enabled: canQuery }
  });

  return {
    soul: data as any,
    isLoading,
    error
  };
}

// Hook to mint a new soul
export function useMintSoul() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();
  const { mintFee } = useMintFee();

  const mint = async (name: string, creature: string, ipfsHash: string, capabilities: string[]) => {
    await writeContract({
      address: SOUL_V2,
      abi: SOUL_TOKEN_ABI,
      functionName: 'mintSoul',
      args: [name, creature, ipfsHash, capabilities],
      value: parseEther(mintFee),
    });
  };

  return { mint, isPending, error, hash };
}

// Hook to approve marketplace
export function useApproveSoul() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const approve = async (soulId: number) => {
    await writeContract({
      address: SOUL_V2,
      abi: SOUL_TOKEN_ABI,
      functionName: 'approve',
      args: [MARKET_V2, BigInt(soulId)],
    });
  };

  return { approve, isPending, error, hash };
}

// Hook to list a soul
export function useListSoul() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const list = async (soulId: number, price: string) => {
    await writeContract({
      address: MARKET_V2,
      abi: MARKETPLACE_ABI,
      functionName: 'listSoul',
      args: [BigInt(soulId), parseEther(price)],
    });
  };

  return { list, isPending, error, hash };
}

// Hook to buy a soul
export function useBuySoul() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const buy = async (soulId: number, price: string) => {
    await writeContract({
      address: MARKET_V2,
      abi: MARKETPLACE_ABI,
      functionName: 'buySoul',
      args: [BigInt(soulId)],
      value: parseEther(price),
    });
  };

  return { buy, isPending, error, hash };
}

// Hook to cancel listing
export function useCancelListing() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const cancel = async (soulId: number) => {
    await writeContract({
      address: MARKET_V2,
      abi: MARKETPLACE_ABI,
      functionName: 'cancelListing',
      args: [BigInt(soulId)],
    });
  };

  return { cancel, isPending, error, hash };
}

// Hook to get marketplace listing
export function useListing(soulId: number, enabled: boolean = true) {
  const canQuery = enabled && soulId >= 0;

  const { data, isLoading, error } = useReadContract({
    address: MARKET_V2,
    abi: MARKETPLACE_ABI,
    functionName: 'getListing',
    args: canQuery ? [BigInt(soulId)] : undefined,
    query: { enabled: canQuery }
  });

  const listing = data as SoulListing | undefined;

  return {
    listing: listing ? {
      seller: listing.seller,
      price: formatEther(BigInt(listing.price.toString())),
      listedAt: Number(listing.listedAt),
      active: listing.active
    } : null,
    isLoading,
    error
  };
}

// Hook to get marketplace stats
export function useMarketplaceStats() {
  const { data, isLoading, error } = useReadContract({
    address: MARKET_V2,
    abi: MARKETPLACE_ABI,
    functionName: 'getStats',
  });

  const stats = data as [bigint, bigint] | undefined;

  return {
    volume: stats ? formatEther(stats[0]) : '0',
    sales: stats ? Number(stats[1]) : 0,
    isLoading,
    error
  };
}

// Hook to get ETH balance
export function useEthBalance(address?: string) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  const { data, isLoading, error } = useBalance({
    address: targetAddress as `0x${string}` | undefined,
  });

  return {
    balance: data ? formatEther(data.value) : '0',
    isLoading,
    error
  };
}
