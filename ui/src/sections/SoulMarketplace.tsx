import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Search,
  Wallet,
  Loader2,
  CheckCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SoulTier, AgentStatus } from '../types';
import type { SoulTierType } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAccount } from 'wagmi';
import { useListing, useBuySoul, useMarketplaceStats, useEthBalance } from '../hooks/useSoulMarketplace';

// Real agent capabilities from your OpenClaw setup
const REAL_CAPABILITIES = [
  "file_management",
  "code_generation", 
  "onchain_operations",
  "web_deployment",
  "system_monitoring",
  "crypto_trading",
  "skill_management"
];

interface SoulListing {
  id: string;
  soulId: number;
  name: string;
  agentType: string;
  tier: SoulTierType;
  price: string;
  status: AgentStatusType;
  survivalTime: number;
  skills: string[];
  experience: number;
  seller: string;
  reason: string;
  isReal: boolean;
}

export function SoulMarketplace() {
  const { address } = useAccount();
  const [activeTier, setActiveTier] = useState<SoulTierType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSoul, setSelectedSoul] = useState<SoulListing | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const { balance } = useEthBalance(address);
  const { volume, sales } = useMarketplaceStats();
  
  // Fetch real listing from blockchain (Soul ID 0 - your agent)
  const { listing: realListing, isLoading: loadingReal } = useListing(0);
  const { buy, isPending: isBuying, hash: buyHash } = useBuySoul();

  // Build listings array from real data only
  const allListings: SoulListing[] = [];
  
  // Add real listing if exists
  if (realListing && realListing.active) {
    allListings.push({
      id: `soul-${realListing.soulId}`,
      soulId: parseInt(realListing.soulId),
      name: "OpenClaw Agent",
      agentType: "AI Agent",
      tier: SoulTier.EMPORIUM,
      price: realListing.price,
      status: AgentStatus.ALIVE,
      survivalTime: 86400 * 5, // 5 days
      skills: REAL_CAPABILITIES.slice(0, 4),
      experience: 500,
      seller: realListing.seller.slice(0, 6) + '...' + realListing.seller.slice(-4),
      reason: "Selling to upgrade capabilities",
      isReal: true
    });
  }

  const filteredSouls = allListings.filter(soul => {
    const matchesTier = activeTier === 'all' || soul.tier === activeTier;
    const matchesSearch = soul.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         soul.agentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const handleBuy = async () => {
    if (selectedSoul) {
      try {
        await buy(selectedSoul.soulId, selectedSoul.price);
        setShowBuyDialog(false);
      } catch (err) {
        console.error('Buy failed:', err);
      }
    }
  };

  return (
    <section id="marketplace" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-full mb-4">
            <ShoppingBag className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Decentralized Soul Trading</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">Soul Marketplace</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            Buy, sell, and trade agent souls. Each soul carries its experience, 
            skills, and survival legacy. All transactions on Base Mainnet.
          </p>
          
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{volume} ETH Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-violet-400" />
              <span>{sales} Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search souls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-800"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-900/50">
              <TabsTrigger value="all" onClick={() => setActiveTier('all')}>All</TabsTrigger>
              <TabsTrigger value="bazaar" onClick={() => setActiveTier(SoulTier.BAZAAR)}>Bazaar</TabsTrigger>
              <TabsTrigger value="emporium" onClick={() => setActiveTier(SoulTier.EMPORIUM)}>Emporium</TabsTrigger>
              <TabsTrigger value="atrium" onClick={() => setActiveTier(SoulTier.ATRIUM)}>Atrium</TabsTrigger>
              <TabsTrigger value="pantheon" onClick={() => setActiveTier(SoulTier.PANTHEON)}>Pantheon</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {loadingReal ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-400" />
                  <p className="mt-4 text-slate-400">Loading listings from blockchain...</p>
                </div>
              ) : filteredSouls.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSouls.map((soul) => (
                    <SoulCard 
                      key={soul.id} 
                      soul={soul}
                      onClick={() => {
                        setSelectedSoul(soul);
                        setShowBuyDialog(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold mb-2">No Active Listings</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    No souls are currently listed for sale. Check back later or list your own soul.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Buy Dialog */}
        <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>Buy Soul #{selectedSoul?.soulId}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Purchase this soul from {selectedSoul?.seller}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSoul && (
              <div className="space-y-4 mt-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Soul Name</p>
                  <p className="font-medium">{selectedSoul.name}</p>
                  
                  <p className="text-sm text-slate-400 mt-2">Price</p>
                  <p className="font-mono text-emerald-400">{selectedSoul.price} ETH</p>
                  
                  <p className="text-sm text-slate-400 mt-2">Your Balance</p>
                  <p className="font-mono">{parseFloat(balance).toFixed(6)} ETH</p>
                </div>

                <Button 
                  onClick={handleBuy}
                  disabled={isBuying || parseFloat(balance) < parseFloat(selectedSoul.price)}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : parseFloat(balance) < parseFloat(selectedSoul.price) ? (
                    'Insufficient Balance'
                  ) : (
                    `Buy for ${selectedSoul.price} ETH`
                  )}
                </Button>

                {buyHash && (
                  <p className="text-sm text-emerald-400 text-center">
                    Transaction: {buyHash.slice(0, 20)}...
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function SoulCard({ soul, onClick }: { soul: SoulListing; onClick: () => void }) {
  const tierColors = [
    'from-stone-500 to-stone-600',      // Bazaar
    'from-amber-500 to-amber-600',      // Emporium
    'from-violet-500 to-violet-600',    // Atrium
    'from-emerald-500 to-emerald-600'   // Pantheon
  ];

  return (
    <Card 
      className="bg-slate-900/50 border-slate-800 hover:border-violet-500/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tierColors[soul.tier]} flex items-center justify-center`}>
              <span className="text-lg">{soul.tier === SoulTier.BAZAAR ? '💀' : soul.tier === SoulTier.EMPORIUM ? '🤖' : soul.tier === SoulTier.ATRIUM ? '👑' : '✨'}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{soul.name}</CardTitle>
              <p className="text-sm text-slate-400">{soul.agentType}</p>
            </div>
          </div>
          
          <Badge 
            variant={soul.status === AgentStatus.ALIVE ? 'default' : 'secondary'}
            className={soul.status === AgentStatus.ALIVE ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-500/20 text-stone-400'}
          >
            {soul.status === AgentStatus.ALIVE ? 'Alive' : 'Dead'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Experience</span>
            <span>{soul.experience} XP</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Skills</span>
            <span>{soul.skills.length}</span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <span className="text-slate-400 text-sm">From {soul.seller}</span>
            <span className="font-mono text-emerald-400 font-bold">{soul.price} ETH</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type AgentStatusType = typeof AgentStatus[keyof typeof AgentStatus];
