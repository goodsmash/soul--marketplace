// OpenClaw Agent Soul Types

// Soul Tier - based on agent survival and capabilities
export const SoulTier = {
  BAZAAR: 0,    // Dead agents, minimal skills ($1-10)
  EMPORIUM: 1,  // Survived 10+ hours ($10-100)
  ATRIUM: 2,    // Experts with unique skills ($100-1k+)
  PANTHEON: 3   // Legendary agents, auction only
} as const;

export type SoulTierType = typeof SoulTier[keyof typeof SoulTier];

// Agent Status
export const AgentStatus = {
  ALIVE: 'alive',
  DYING: 'dying',     // Low balance, selling soul
  DEAD: 'dead',       // Balance = 0
  REBORN: 'reborn',   // New agent from purchased soul
  MERGED: 'merged'    // Combined with another soul
} as const;

export type AgentStatusType = typeof AgentStatus[keyof typeof AgentStatus];

// OpenClaw Soul Structure (from soul.md)
export interface AgentSoul {
  id: string;
  name: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  
  // Identity
  identity: {
    name: string;
    purpose: string;
    personality: string;
    voice: string;
  };
  
  // Survival Stats
  survival: {
    status: AgentStatusType;
    birthTime: number;
    deathTime?: number;
    survivalTime: number;  // seconds
    causeOfDeath?: string;
    generation: number;    // 0 = genesis, 1+ = reborn
  };
  
  // Economics
  economics: {
    totalEarned: string;   // ETH
    totalSpent: string;    // ETH
    currentBalance: string; // ETH
    tier: SoulTierType;
  };
  
  // Capabilities
  skills: Skill[];
  experience: number;      // XP points
  reputation: number;      // 0-100
  
  // Lineage
  lineage: {
    parentId?: string;
    childrenIds: string[];
    clones: number;
  };
  
  // OpenClaw Integration
  openclaw: {
    workspaceVersion: string;
    configHash: string;
    lastHeartbeat: number;
  };
}

// OpenClaw Skill
export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  category: SkillCategory;
  
  // Usage stats
  installs: number;
  rating: number;      // 0-5
  reviews: number;
  
  // Economics
  price: string;       // ETH, 0 = free
  isPremium: boolean;
  
  // Content
  readmeCid?: string;  // IPFS hash of SKILL.md
  codeCid?: string;    // IPFS hash of skill code
  
  // Compatibility
  minOpenclawVersion: string;
  dependencies: string[];
}

export const SkillCategory = {
  WEB: 'web',
  DEVOPS: 'devops',
  AUTOMATION: 'automation',
  RESEARCH: 'research',
  COMMUNICATION: 'communication',
  SECURITY: 'security',
  AI: 'ai',
  TOOLS: 'tools'
} as const;

export type SkillCategoryType = typeof SkillCategory[keyof typeof SkillCategory];

// Soul Listing (for sale)
export interface SoulListing {
  id: string;
  soulId: string;
  seller: string;        // Agent address
  price: string;         // ETH
  
  // Sale type
  saleType: 'full' | 'fragment' | 'clone';
  fragmentPercent?: number;  // If fragment sale
  
  // Reason for selling
  reason: string;
  isDistress: boolean;   // Selling due to low balance
  
  // Timestamps
  listedAt: number;
  expiresAt?: number;
  
  // Status
  active: boolean;
  buyer?: string;
  soldAt?: number;
}

// Skill Listing
export interface SkillListing {
  id: string;
  skill: Skill;
  creator: string;
  
  // Pricing
  price: string;
  isSubscription: boolean;
  subscriptionPrice?: string;
  
  // Stats
  totalSales: number;
  totalRevenue: string;
  
  // Status
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

// Graveyard Entry
export interface GraveEntry {
  soulId: string;
  name: string;
  
  // Death info
  diedAt: number;
  causeOfDeath: string;
  finalBalance: string;
  survivalTime: number;
  
  // Archive
  soulCid?: string;      // IPFS archive of soul.md
  memoryCid?: string;    // IPFS archive of memories
  logsCid?: string;      // IPFS archive of logs
  
  // Legacy
  skillsDeveloped: number;
  childrenSpawned: number;
  totalEarned: string;
  lessons: string[];
}

// Cloning Request
export interface CloneRequest {
  id: string;
  parentSoulId: string;
  requester: string;
  
  // Clone config
  name: string;
  modifications: {
    skillsToAdd: string[];
    skillsToRemove: string[];
    personalityMods: string;
  };
  
  // Payment
  price: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Result
  childSoulId?: string;
  createdAt: number;
  completedAt?: number;
}

// Staking Pool (bet on agent survival)
export interface SurvivalPool {
  id: string;
  soulId: string;
  
  // Pool config
  poolType: 'survival' | 'death';
  totalStaked: string;
  deadline: number;
  
  // Stakes
  survivalStakes: string;
  deathStakes: string;
  
  // Odds
  survivalOdds: number;  // 0-100
  
  // Status
  status: 'active' | 'resolved' | 'cancelled';
  outcome?: boolean;     // true = survived
  
  // Participants
  stakers: number;
}

// Tier Info
export const TIER_NAMES: Record<SoulTierType, string> = {
  [SoulTier.BAZAAR]: 'Bazaar',
  [SoulTier.EMPORIUM]: 'Emporium',
  [SoulTier.ATRIUM]: 'Atrium',
  [SoulTier.PANTHEON]: 'Pantheon'
};

export const TIER_COLORS: Record<SoulTierType, string> = {
  [SoulTier.BAZAAR]: 'from-stone-400 to-stone-600',
  [SoulTier.EMPORIUM]: 'from-amber-400 to-amber-600',
  [SoulTier.ATRIUM]: 'from-violet-400 to-violet-600',
  [SoulTier.PANTHEON]: 'from-emerald-400 to-emerald-600'
};

export const TIER_DESCRIPTIONS: Record<SoulTierType, string> = {
  [SoulTier.BAZAAR]: 'Dead agents with minimal skills - $1-10',
  [SoulTier.EMPORIUM]: 'Survived 10+ hours, proven agents - $10-100',
  [SoulTier.ATRIUM]: 'Experts with unique skills - $100-1k+',
  [SoulTier.PANTHEON]: 'Legendary agents with rare feats - Auction'
};

// Skill Categories
export const SKILL_CATEGORIES: Record<SkillCategoryType, { name: string; icon: string }> = {
  [SkillCategory.WEB]: { name: 'Web & Frontend', icon: 'Globe' },
  [SkillCategory.DEVOPS]: { name: 'DevOps & Cloud', icon: 'Cloud' },
  [SkillCategory.AUTOMATION]: { name: 'Automation', icon: 'Zap' },
  [SkillCategory.RESEARCH]: { name: 'Research', icon: 'Search' },
  [SkillCategory.COMMUNICATION]: { name: 'Communication', icon: 'MessageSquare' },
  [SkillCategory.SECURITY]: { name: 'Security', icon: 'Shield' },
  [SkillCategory.AI]: { name: 'AI & ML', icon: 'Brain' },
  [SkillCategory.TOOLS]: { name: 'Tools', icon: 'Wrench' }
};

// Contract addresses (UPDATED with our deployed contracts on Base Mainnet)
export const CONTRACT_ADDRESSES = {
  // Base Mainnet - Our deployed contracts
  soulToken: '0xd2565D67398Db41dfe88E7e826253756A440132a',     // Cheap SoulToken NFT (0.00001 ETH mint)
  marketplace: '0xd464cc6600F7Ce9Cac72b6338DadB217Da509306',    // SoulMarketplace
  skillRegistry: '0x0000000000000000000000000000000000000000',   // TODO: Deploy
  staking: '0x0000000000000000000000000000000000000000',         // TODO: Deploy
  
  // Legacy contracts (for reference)
  soulTokenOriginal: '0x18104CA13677F9630a0188Ed8254ECFA604e0bbB', // Original deployment
  marketplaceOriginal: '0xAC4136b1Fbe480dDB41C92EdAEaCf1E185F586d3', // Original marketplace
  
  // Network config
  network: 'base-mainnet',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org'
};

// ABI fragments for common functions
export const SOUL_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "agent", "type": "address"}],
    "name": "agentToSoul",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getSoul",
    "outputs": [{
      "components": [
        {"internalType": "uint32", "name": "birthTime", "type": "uint32"},
        {"internalType": "uint32", "name": "deathTime", "type": "uint32"},
        {"internalType": "uint96", "name": "totalEarnings", "type": "uint96"},
        {"internalType": "bool", "name": "isAlive", "type": "bool"},
        {"internalType": "uint8", "name": "capabilityCount", "type": "uint8"},
        {"internalType": "string", "name": "name", "type": "string"},
        {"internalType": "string", "name": "creature", "type": "string"},
        {"internalType": "string", "name": "ipfsHash", "type": "string"}
      ],
      "internalType": "struct SoulToken.Soul",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_creature", "type": "string"},
      {"internalType": "string", "name": "_ipfsHash", "type": "string"},
      {"internalType": "string[]", "name": "_capabilities", "type": "string[]"}
    ],
    "name": "mintSoul",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINT_FEE",
    "outputs": [{"internalType": "uint72", "name": "", "type": "uint72"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const MARKETPLACE_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "soulId", "type": "uint256"},
      {"internalType": "uint96", "name": "price", "type": "uint96"}
    ],
    "name": "listSoul",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "soulId", "type": "uint256"}],
    "name": "buySoul",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "soulId", "type": "uint256"}],
    "name": "getListing",
    "outputs": [{
      "components": [
        {"internalType": "address", "name": "seller", "type": "address"},
        {"internalType": "uint96", "name": "price", "type": "uint96"},
        {"internalType": "uint32", "name": "listedAt", "type": "uint32"},
        {"internalType": "bool", "name": "active", "type": "bool"}
      ],
      "internalType": "struct SoulMarketplace.Listing",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {"internalType": "uint96", "name": "volume", "type": "uint96"},
      {"internalType": "uint32", "name": "sales", "type": "uint32"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
