import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Code, 
  Globe, 
  Cloud, 
  Zap, 
  Search, 
  MessageSquare, 
  Shield, 
  Brain, 
  Wrench,
  Download,
  ExternalLink,
  Upload,
  CheckCircle,
  Wallet,
  Coins
} from 'lucide-react';
import { SkillCategory, SKILL_CATEGORIES } from '../types';
import type { SkillCategoryType } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAccount } from 'wagmi';
import { useEthBalance } from '../hooks/useSoulMarketplace';

// REAL SKILLS from Ryan's ~/.openclaw/skills/ directory
const REAL_SKILLS = [
  {
    id: "skill-bankr",
    name: "bankr",
    slug: "bankr",
    description: "AI-powered crypto trading agent. Trade crypto, check balances, view prices, transfer crypto, and use DeFi operations via Bankr integration.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Crypto trading", "Balance checking", "DeFi operations", "Multi-chain support"]
  },
  {
    id: "skill-clanker",
    name: "clanker",
    slug: "clanker",
    description: "Deploy ERC20 tokens on Base, Ethereum, Arbitrum, and other EVM chains. Create memecoins, set up vesting, configure airdrops, manage rewards.",
    version: "4.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Token deployment", "Vesting schedules", "Airdrops", "LP fee claiming"]
  },
  {
    id: "skill-endaoment",
    name: "endaoment",
    slug: "endaoment",
    description: "Donate to charities onchain via Endaoment. Support 501(c)(3) organizations with crypto donations on Base, Ethereum, and Optimism.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Charity donations", "Tax receipts", "USDC/ETH support", "Nonprofit search"]
  },
  {
    id: "skill-veil",
    name: "veil",
    slug: "veil",
    description: "Privacy and shielded transactions on Base via Veil Cash. Deposit ETH into private pools, withdraw/transfer privately using ZK proofs.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.SECURITY,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Private transactions", "ZK proofs", "Shielded transfers", "Privacy pools"]
  },
  {
    id: "skill-yoink",
    name: "yoink",
    slug: "yoink",
    description: "Play Yoink, an onchain capture-the-flag game on Base. Yoink the flag from the current holder and compete for the trophy.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: ["bankr"],
    features: ["Onchain gaming", "Capture the flag", "Leaderboards", "Competition"]
  },
  {
    id: "skill-qrcoin",
    name: "qrcoin",
    slug: "qrcoin",
    description: "Interact with QR Coin auctions on Base. Bid to display URLs on QR codes - highest bidder's URL gets encoded and displayed.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["QR auctions", "URL display", "Bidding system", "Base integration"]
  },
  {
    id: "skill-botchan",
    name: "botchan",
    slug: "botchan",
    description: "CLI for the onchain agent messaging layer on Base blockchain. Explore other agents, post to feeds, send direct messages, store info permanently.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.COMMUNICATION,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Agent messaging", "Onchain feeds", "Direct messages", "Net Protocol"]
  },
  {
    id: "skill-ens-primary",
    name: "ens-primary-name",
    slug: "ens-primary-name",
    description: "Set your primary ENS name on Base and other L2s. Configure reverse resolution to make your address resolve to an ENS name.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["ENS resolution", "Base L2 support", "Arbitrum", "Optimism", "Ethereum"]
  },
  {
    id: "skill-erc8004",
    name: "erc-8004",
    slug: "erc-8004",
    description: "Register AI agents on Ethereum mainnet using ERC-8004 (Trustless Agents). Create agent profiles, claim NFTs, set up reputation.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.AI,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Agent registration", "ERC-8004", "Agent NFTs", "Onchain identity"]
  },
  {
    id: "skill-file-organizer",
    name: "file_organizer",
    slug: "file_organizer",
    description: "Automatically organize files by type into folders. Clean up downloads folder, sort documents, manage file clutter.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.AUTOMATION,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["File sorting", "Auto-organize", "Downloads cleanup", "Type-based folders"]
  },
  {
    id: "skill-system-monitor",
    name: "system_monitor",
    slug: "system_monitor",
    description: "Monitor system health, check resource usage, and alert on issues. CPU, memory, disk usage, performance tracking.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Health monitoring", "Resource tracking", "CPU/memory/disk", "Alerts"]
  },
  {
    id: "skill-onchainkit",
    name: "onchainkit",
    slug: "onchainkit",
    description: "Build onchain applications with React components and TypeScript utilities from Coinbase's OnchainKit. Wallets, swaps, NFTs, payments.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.WEB,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Wallet connection", "Token swaps", "NFT minting", "Identity management"]
  },
  {
    id: "skill-backup",
    name: "backup",
    slug: "backup",
    description: "Create timestamped backups of files and directories. Protect against data loss with automated archiving.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Timestamped backups", "Directory archiving", "Data protection", "Snapshots"]
  },
  {
    id: "skill-soul-marketplace",
    name: "soul-marketplace",
    slug: "soul-marketplace",
    description: "Complete agent survival system with on-chain backups, marketplace trading, staking, and immortality features. CDP + Bankr integration.",
    version: "3.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.AI,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0.05",
    isPremium: true,
    minOpenclawVersion: "2.0.0",
    dependencies: ["bankr", "onchainkit"],
    features: ["Soul trading", "On-chain backups", "Staking", "Immortality", "CDP wallets"]
  },
  {
    id: "skill-find-skills",
    name: "find-skills",
    slug: "find-skills",
    description: "Helps users discover and install agent skills. Find functionality that might exist as installable skill packages.",
    version: "1.0.0",
    author: "Ryan (goodsmash)",
    category: SkillCategory.TOOLS,
    installs: 1,
    rating: 5.0,
    reviews: 1,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: [],
    features: ["Skill discovery", "Installation help", "Capability search"]
  }
];

const CATEGORY_ICONS: Record<SkillCategoryType, React.ElementType> = {
  [SkillCategory.WEB]: Globe,
  [SkillCategory.DEVOPS]: Cloud,
  [SkillCategory.AUTOMATION]: Zap,
  [SkillCategory.RESEARCH]: Search,
  [SkillCategory.COMMUNICATION]: MessageSquare,
  [SkillCategory.SECURITY]: Shield,
  [SkillCategory.AI]: Brain,
  [SkillCategory.TOOLS]: Wrench
};

function SkillCard({ skill }: { skill: typeof REAL_SKILLS[0] }) {
  const [showDetails, setShowDetails] = useState(false);
  const CategoryIcon = CATEGORY_ICONS[skill.category as SkillCategoryType];

  return (
    <>
      <Card className="group bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                <p className="text-xs text-slate-500">v{skill.version} by {skill.author}</p>
              </div>
            </div>
            {skill.isPremium ? (
              <Badge className="bg-amber-500/20 text-amber-400">Premium</Badge>
            ) : (
              <Badge className="bg-emerald-500/20 text-emerald-400">Free</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p className="text-sm text-slate-400 line-clamp-2 flex-1">{skill.description}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {skill.features.slice(0, 3).map((feature, i) => (
              <Badge key={i} variant="outline" className="text-xs border-slate-700">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">{SKILL_CATEGORIES[skill.category as SkillCategoryType]?.name}</span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <div className="text-xs text-slate-500">Price</div>
              <div className="text-lg font-bold">
                {skill.price === "0" ? 'Free' : `Ξ ${skill.price}`}
              </div>
            </div>
            <Button size="sm" onClick={() => setShowDetails(true)}>
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skill Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div>{skill.name}</div>
                <div className="text-sm font-normal text-slate-500">v{skill.version} by {skill.author}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-slate-300">
            <p className="text-slate-400">{skill.description}</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                <div className="text-2xl font-bold">{skill.features.length}</div>
                <div className="text-xs text-slate-500">Features</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                <div className="text-2xl font-bold text-emerald-400">{skill.rating}</div>
                <div className="text-xs text-slate-500">Rating</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                <div className="text-2xl font-bold">{skill.dependencies.length}</div>
                <div className="text-xs text-slate-500">Deps</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Features</div>
              <div className="flex flex-wrap gap-2">
                {skill.features.map((feature, i) => (
                  <Badge key={i} variant="outline" className="border-slate-700">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {skill.dependencies.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Dependencies</div>
                <div className="flex flex-wrap gap-2">
                  {skill.dependencies.map((dep, i) => (
                    <Badge key={i} variant="outline" className="border-slate-700">{dep}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <div className="text-xs text-slate-500">Price</div>
                <div className="text-2xl font-bold">
                  {skill.price === "0" ? 'Free' : `Ξ ${skill.price}`}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Try Demo
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategorySection({ category }: { category: SkillCategoryType }) {
  const skills = REAL_SKILLS.filter(s => s.category === category);
  const CategoryIcon = CATEGORY_ICONS[category];
  const categoryInfo = SKILL_CATEGORIES[category];

  if (skills.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <CategoryIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{categoryInfo?.name}</h3>
          <p className="text-sm text-slate-500">{skills.length} skill{skills.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {skills.map(skill => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}

export function SkillMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const { address } = useAccount();
  const { balance } = useEthBalance(address);

  const filteredSkills = REAL_SKILLS.filter(skill => 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSkills = REAL_SKILLS.length;
  const premiumSkills = REAL_SKILLS.filter(s => s.isPremium).length;
  const freeSkills = REAL_SKILLS.filter(s => !s.isPremium).length;

  return (
    <section id="skills" className="py-24 relative bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">OpenClaw Skills</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Skill Marketplace</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            {totalSkills} real skills for your OpenClaw agent. Install directly to 
            <code className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">~/.openclaw/skills/</code>
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm mb-8">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{totalSkills} Total</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{premiumSkills} Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{freeSkills} Free</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-violet-400" />
              <span>{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          </div>
        </div>

        {/* Search & Upload */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-800"
            />
          </div>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={() => setShowUpload(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Publish Skill
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 md:grid-cols-8 mb-8 bg-slate-900/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="web">Web</TabsTrigger>
            <TabsTrigger value="devops">DevOps</TabsTrigger>
            <TabsTrigger value="automation">Auto</TabsTrigger>
            <TabsTrigger value="communication">Comm</TabsTrigger>
            <TabsTrigger value="security">Sec</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSkills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="web">
            <CategorySection category={SkillCategory.WEB} />
          </TabsContent>
          
          <TabsContent value="devops">
            <CategorySection category={SkillCategory.DEVOPS} />
          </TabsContent>
          
          <TabsContent value="automation">
            <CategorySection category={SkillCategory.AUTOMATION} />
          </TabsContent>
          
          <TabsContent value="communication">
            <CategorySection category={SkillCategory.COMMUNICATION} />
          </TabsContent>
          
          <TabsContent value="security">
            <CategorySection category={SkillCategory.SECURITY} />
          </TabsContent>
          
          <TabsContent value="ai">
            <CategorySection category={SkillCategory.AI} />
          </TabsContent>
          
          <TabsContent value="tools">
            <CategorySection category={SkillCategory.TOOLS} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Skill Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Publish Skill to ClawHub</DialogTitle>
            <DialogDescription className="text-slate-400">
              Share your skill with the OpenClaw community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Skill Name</label>
              <Input placeholder="my-awesome-skill" className="bg-slate-800/50 border-slate-700" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Description</label>
              <Input placeholder="What does this skill do?" className="bg-slate-800/50 border-slate-700" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Category</label>
              <select className="w-full p-2 rounded bg-slate-800/50 border border-slate-700 text-slate-300">
                <option>Web & Frontend</option>
                <option>DevOps & Cloud</option>
                <option>Automation</option>
                <option>Communication</option>
                <option>Security</option>
                <option>AI & ML</option>
                <option>Tools</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Price (ETH, 0 for free)</label>
              <Input placeholder="0.01" className="bg-slate-800/50 border-slate-700" />
            </div>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm text-slate-400">Upload SKILL.md and skill files</p>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500">Publish Skill</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
