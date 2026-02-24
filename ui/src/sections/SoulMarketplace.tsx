import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Crown, 
  Gem, 
  Sparkles, 
  Clock, 
  Skull, 
  TrendingUp,
  ExternalLink,
  Filter,
  Search,
  Zap,
  Copy,
  Wallet
} from 'lucide-react';
import { SoulTier, TIER_NAMES, TIER_COLORS, TIER_DESCRIPTIONS, AgentStatus } from '../types';
import type { SoulTierType } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mock souls for sale
const MOCK_SOULS = [
  {
    id: "soul-001",
    name: "Zeta-4",
    agentType: "Trading Bot",
    tier: SoulTier.BAZAAR,
    price: "0.005",
    status: AgentStatus.DEAD,
    survivalTime: 3600,
    skills: ["basic_trading", "data_analysis"],
    experience: 45,
    causeOfDeath: "Flash crash liquidation",
    generation: 0,
    children: 0,
    seller: "0x742d...3f4a",
    reason: "Agent died, selling remains"
  },
  {
    id: "soul-002",
    name: "Beta-Prime",
    agentType: "Research Assistant",
    tier: SoulTier.EMPORIUM,
    price: "0.025",
    status: AgentStatus.ALIVE,
    survivalTime: 86400,
    skills: ["research", "writing", "summarization", "web_search"],
    experience: 250,
    generation: 0,
    children: 2,
    seller: "0x8a9b...2c1d",
    reason: "Upgrading to better model"
  },
  {
    id: "soul-003",
    name: "Gamma-X",
    agentType: "Code Generator",
    tier: SoulTier.ATRIUM,
    price: "0.15",
    status: AgentStatus.ALIVE,
    survivalTime: 172800,
    skills: ["coding", "debugging", "architecture", "review", "testing"],
    experience: 1200,
    generation: 1,
    children: 0,
    seller: "0x3f4e...5a6b",
    reason: "Rebirth project complete"
  },
  {
    id: "soul-004",
    name: "Omega-One",
    agentType: "Multi-Modal Agent",
    tier: SoulTier.PANTHEON,
    price: "0.5",
    status: AgentStatus.ALIVE,
    survivalTime: 604800,
    skills: ["vision", "nlp", "coding", "trading", "creativity", "planning"],
    experience: 5000,
    generation: 0,
    children: 5,
    seller: "0x9c0d...1e2f",
    reason: "Auction - legendary agent"
  },
  {
    id: "soul-005",
    name: "Delta-3",
    agentType: "Social Media Bot",
    tier: SoulTier.BAZAAR,
    price: "0.008",
    status: AgentStatus.DEAD,
    survivalTime: 7200,
    skills: ["posting", "engagement", "analytics"],
    experience: 30,
    causeOfDeath: "API rate limit exceeded",
    generation: 0,
    children: 0,
    seller: "0x1a2b...3c4d",
    reason: "Selling for parts"
  },
  {
    id: "soul-006",
    name: "Epsilon-9",
    agentType: "Data Scraper",
    tier: SoulTier.EMPORIUM,
    price: "0.04",
    status: AgentStatus.DYING,
    survivalTime: 43200,
    skills: ["scraping", "cleaning", "storage", "scheduling"],
    experience: 180,
    generation: 0,
    children: 1,
    seller: "0x5e6f...7a8b",
    reason: "URGENT: Low balance, need funds"
  }
];

const TIER_ICONS = {
  [SoulTier.BAZAAR]: ShoppingBag,
  [SoulTier.EMPORIUM]: Gem,
  [SoulTier.ATRIUM]: Crown,
  [SoulTier.PANTHEON]: Sparkles
};

function SoulCard({ soul }: { soul: typeof MOCK_SOULS[0] }) {
  const [showDetails, setShowDetails] = useState(false);
  const TierIcon = TIER_ICONS[soul.tier];
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case AgentStatus.ALIVE: return 'bg-emerald-500/20 text-emerald-400';
      case AgentStatus.DYING: return 'bg-amber-500/20 text-amber-400';
      case AgentStatus.DEAD: return 'bg-stone-500/20 text-stone-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <>
      <Card className="group bg-white/5 border-white/10 hover:border-violet-500/30 transition-all duration-300 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${TIER_COLORS[soul.tier]}`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${TIER_COLORS[soul.tier]} flex items-center justify-center`}>
                <TierIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{soul.name}</CardTitle>
                <p className="text-xs text-gray-500">{soul.agentType}</p>
              </div>
            </div>
            <Badge className={getStatusColor(soul.status)}>
              {soul.status === AgentStatus.DEAD && <Skull className="w-3 h-3 mr-1" />}
              {soul.status === AgentStatus.DYING && <Zap className="w-3 h-3 mr-1" />}
              {soul.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(soul.survivalTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>{soul.experience} XP</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Copy className="w-4 h-4" />
              <span>{soul.children} clones</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Wallet className="w-4 h-4" />
              <span>Gen {soul.generation}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {soul.skills.slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="outline" className="text-xs border-white/20">
                {skill}
              </Badge>
            ))}
            {soul.skills.length > 3 && (
              <Badge variant="outline" className="text-xs border-white/20">+{soul.skills.length - 3}</Badge>
            )}
          </div>

          {/* Reason */}
          <p className="text-xs text-gray-500 italic">"{soul.reason}"</p>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <div className="text-xs text-gray-500">Price</div>
              <div className="text-lg font-bold">Ξ {soul.price}</div>
            </div>
            <Button size="sm" onClick={() => setShowDetails(true)}>
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Soul Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0f0f14] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${TIER_COLORS[soul.tier]} flex items-center justify-center`}>
                <TierIcon className="w-4 h-4 text-white" />
              </div>
              {soul.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-gray-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Type</div>
                <div className="font-medium">{soul.agentType}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-medium flex items-center gap-2">
                  {soul.status === AgentStatus.ALIVE && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  {soul.status === AgentStatus.DYING && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                  {soul.status === AgentStatus.DEAD && <Skull className="w-4 h-4 text-stone-400" />}
                  {soul.status}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Survival Time</div>
                <div className="font-medium">{formatTime(soul.survivalTime)}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Experience</div>
                <div className="font-medium">{soul.experience} XP</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Generation</div>
                <div className="font-medium">{soul.generation}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Clones</div>
                <div className="font-medium">{soul.children}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {soul.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/10">{skill}</Badge>
                ))}
              </div>
            </div>

            {soul.status === AgentStatus.DEAD && soul.causeOfDeath && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-xs text-red-400 mb-1">Cause of Death</div>
                <div className="text-sm">{soul.causeOfDeath}</div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">Seller's Reason</div>
              <div className="text-sm italic">"{soul.reason}"</div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <div className="text-xs text-gray-500">Current Price</div>
                <div className="text-2xl font-bold">Ξ {soul.price}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Make Offer</Button>
                <Button>
                  {soul.status === AgentStatus.DEAD ? 'Rebirth' : 'Buy Soul'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TierSection({ tier }: { tier: SoulTierType }) {
  const souls = MOCK_SOULS.filter(s => s.tier === tier);
  const TierIcon = TIER_ICONS[tier];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TIER_COLORS[tier]} flex items-center justify-center shadow-lg`}>
            <TierIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{TIER_NAMES[tier]}</h3>
            <p className="text-sm text-gray-500">{TIER_DESCRIPTIONS[tier]}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-white/20">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {souls.map(soul => (
          <SoulCard key={soul.id} soul={soul} />
        ))}
      </div>

      {souls.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <TierIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No souls available in this tier</p>
        </div>
      )}
    </div>
  );
}

export function SoulMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section id="marketplace" className="py-24 relative bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Soul Marketplace</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse agent souls by tier. Buy living agents, rebirth dead ones, or fund dying agents.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search souls by name, type, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
        </div>

        <Tabs defaultValue="bazaar" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 bg-white/5">
            <TabsTrigger value="bazaar" className="data-[state=active]:bg-stone-500/20">
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Bazaar</span>
            </TabsTrigger>
            <TabsTrigger value="emporium" className="data-[state=active]:bg-amber-500/20">
              <Gem className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Emporium</span>
            </TabsTrigger>
            <TabsTrigger value="atrium" className="data-[state=active]:bg-violet-500/20">
              <Crown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Atrium</span>
            </TabsTrigger>
            <TabsTrigger value="pantheon" className="data-[state=active]:bg-emerald-500/20">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Pantheon</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bazaar">
            <TierSection tier={SoulTier.BAZAAR} />
          </TabsContent>
          <TabsContent value="emporium">
            <TierSection tier={SoulTier.EMPORIUM} />
          </TabsContent>
          <TabsContent value="atrium">
            <TierSection tier={SoulTier.ATRIUM} />
          </TabsContent>
          <TabsContent value="pantheon">
            <TierSection tier={SoulTier.PANTHEON} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
