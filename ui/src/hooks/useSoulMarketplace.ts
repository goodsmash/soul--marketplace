import { useReadContract, useWriteContract, useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESSES, SOUL_TOKEN_ABI, MARKETPLACE_ABI } from '../types';
import type { SoulListing } from '../types';

// Hook to get mint fee
export function useMintFee() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.soulToken as `0x${string}`,
    abi: SOUL_TOKEN_ABI,
    functionName: 'MINT_FEE',
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

  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.soulToken as `0x${string}`,
    abi: SOUL_TOKEN_ABI,
    functionName: 'agentToSoul',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!targetAddress,
    }
  });

  const soulId = data ? Number(data as bigint) : 0;

  return {
    hasSoul: soulId > 0,
    soulId,
    isLoading,
    error
  };
}

// Hook to get soul details
export function useSoulDetails(soulId: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.soulToken as `0x${string}`,
    abi: SOUL_TOKEN_ABI,
    functionName: 'getSoul',
    args: soulId > 0 ? [BigInt(soulId)] : undefined,
    query: {
      enabled: soulId > 0,
    }
  });

  // Properly type the returned data
  const soul = data as {
    0: number; // birthTime
    1: number; // deathTime
    2: bigint; // totalEarnings
    3: boolean; // isAlive
    4: number; // capabilityCount
    5: string; // name
    6: string; // creature
    7: string; // ipfsHash
  } | undefined;

  return {
    soul,
    isLoading,
    error
  };
}

// Hook to mint a soul
export function useMintSoul() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();
  const { mintFee } = useMintFee();

  const mint = async (name: string, creature: string, ipfsHash: string, capabilities: string[]) => {
    await writeContract({
      address: CONTRACT_ADDRESSES.soulToken as `0x${string}`,
      abi: SOUL_TOKEN_ABI,
      functionName: 'mintSoul',
      args: [name, creature, ipfsHash, capabilities],
      value: parseEther(mintFee),
    });
  };

  return {
    mint,
    isPending,
    error,
    hash
  };
}

// Hook to get marketplace listing
export function useListing(soulId: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.marketplace as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'getListing',
    args: soulId > 0 ? [BigInt(soulId)] : undefined,
    query: {
      enabled: soulId > 0,
    }
  });

  // Properly type the returned data
  const listingData = data as {
    0: string; // seller
    1: bigint; // price
    2: number; // listedAt
    3: boolean; // active
  } | undefined;

  if (!listingData) {
    return { listing: null, isLoading, error };
  }

  const listing: SoulListing = {
    id: `listing-${soulId}`,
    soulId: soulId.toString(),
    seller: listingData[0],
    price: formatEther(listingData[1]),
    saleType: 'full',
    reason: '',
    isDistress: false,
    listedAt: listingData[2],
    active: listingData[3],
  };

  return {
    listing,
    isLoading,
    error
  };
}

// Hook to list a soul for sale
export function useListSoul() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const list = async (soulId: number, price: string) => {
    await writeContract({
      address: CONTRACT_ADDRESSES.marketplace as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'listSoul',
      args: [BigInt(soulId), parseEther(price)],
    });
  };

  return {
    list,
    isPending,
    error,
    hash
  };
}

// Hook to buy a soul
export function useBuySoul() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const buy = async (soulId: number, price: string) => {
    await writeContract({
      address: CONTRACT_ADDRESSES.marketplace as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'buySoul',
      args: [BigInt(soulId)],
      value: parseEther(price),
    });
  };

  return {
    buy,
    isPending,
    error,
    hash
  };
}

// Hook to get marketplace stats
export function useMarketplaceStats() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.marketplace as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'getStats',
  });

  // Properly type the returned data
  const statsData = data as [bigint, number] | undefined;

  if (!statsData) {
    return { volume: '0', sales: 0, isLoading, error };
  }

  return {
    volume: formatEther(statsData[0]),
    sales: statsData[1],
    isLoading,
    error
  };
}

// Hook to get user's ETH balance
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
