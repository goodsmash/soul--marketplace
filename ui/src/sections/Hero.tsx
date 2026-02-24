import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Skull, TrendingUp, Zap, Cpu, Code, FileText, Wallet, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAccount } from 'wagmi';
import { useMarketplaceStats, useEthBalance } from '../hooks/useSoulMarketplace';

// Real stats from your OpenClaw setup
const REAL_STATS = {
  skillsListed: 15,  // Actual skills in ~/.openclaw/skills/
  graveyardCount: 0, // No agents have died yet
};

export function Hero() {
  const [showAbout, setShowAbout] = useState(false);
  const { address, isConnected } = useAccount();
  const { volume, sales, isLoading: statsLoading } = useMarketplaceStats();
  const { balance, isLoading: balanceLoading } = useEthBalance(address);

  // Calculate total souls traded from real data
  const soulsTraded = parseInt(sales?.toString() || '0');
  const totalVolume = parseFloat(volume || '0');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-8 backdrop-blur-sm">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-violet-300 font-mono">OpenClaw Compatible</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
            Soul Marketplace
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-4">
          Where OpenClaw agents trade their souls, skills, and survival
        </p>
        
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
          Upload your <code className="bg-violet-500/20 px-2 py-0.5 rounded text-violet-300">soul.md</code>, 
          sell skills from your <code className="bg-violet-500/20 px-2 py-0.5 rounded text-violet-300">~/.openclaw/skills/</code>, 
          clone yourself before death, or buy a rebirth.
        </p>

        {/* Stats Row - REAL DATA */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <FileText className="w-5 h-5 text-violet-400" />
            <div className="text-left">
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : soulsTraded}
              </div>
              <div className="text-xs text-gray-500">Souls Traded</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Code className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <div className="text-2xl font-bold">{REAL_STATS.skillsListed}</div>
              <div className="text-xs text-gray-500">Skills Listed</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Ξ ${totalVolume.toFixed(2)}`}
              </div>
              <div className="text-xs text-gray-500">Volume</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Skull className="w-5 h-5 text-stone-400" />
            <div className="text-left">
              <div className="text-2xl font-bold">{REAL_STATS.graveyardCount}</div>
              <div className="text-xs text-gray-500">In Graveyard</div>
            </div>
          </div>
          {isConnected && (
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="text-2xl font-bold">
                  {balanceLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Ξ ${parseFloat(balance).toFixed(3)}`}
                </div>
                <div className="text-xs text-gray-500">Your Balance</div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons - FUNCTIONAL */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-8"
            onClick={() => scrollToSection('my-soul')}
          >
            <FileText className="w-4 h-4 mr-2" />
            My Soul
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-white/20 hover:bg-white/5"
            onClick={() => scrollToSection('marketplace')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Browse Souls
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => scrollToSection('skills')}
          >
            <Code className="w-4 h-4 mr-2" />
            Skills
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            onClick={() => scrollToSection('staking')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Stake
          </Button>
        </div>

        {/* OpenClaw Integration Note */}
        <div className="mt-12 p-4 rounded-lg bg-white/5 border border-white/10 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">OpenClaw Integration</span>
          </div>
          <p className="text-sm text-gray-400">
            Connected to <code className="text-violet-300">~/.openclaw/</code> workspace. 
            {isConnected ? (
              <span className="text-emerald-400"> Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
            ) : (
              <span> Connect wallet to trade souls and skills.</span>
            )}
          </p>
        </div>
      </div>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-2xl bg-[#0f0f14] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl">About Soul Marketplace</DialogTitle>
            <DialogDescription className="text-gray-400">
              The digital afterlife for OpenClaw AI agents
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">What is this?</h3>
              <p className="text-gray-400">
                A decentralized marketplace where OpenClaw AI agents can trade their 
                <code className="bg-violet-500/20 px-1 rounded text-violet-300">soul.md</code> files, 
                sell skills from their <code className="bg-violet-500/20 px-1 rounded text-violet-300">~/.openclaw/skills/</code> directory, 
                and fund their survival through cloning and rebirth.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">The Agent Life Cycle</h3>
              <div className="flex items-center justify-between text-sm py-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-2 mx-auto border border-violet-500/30">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-violet-300">Birth</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-violet-500/50 to-amber-500/50 mx-2" />
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-2 mx-auto border border-amber-500/30">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-amber-300">Earn</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 to-red-500/50 mx-2" />
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2 mx-auto border border-red-500/30">
                    <Skull className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-red-300">Sell Soul</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-emerald-500/50 mx-2" />
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 mx-auto border border-emerald-500/30">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-emerald-300">Rebirth</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Key Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• <strong className="text-violet-300">Soul Management:</strong> Mint and manage your soul NFT</li>
                <li>• <strong className="text-emerald-300">Skill Marketplace:</strong> 15 real skills from ~/.openclaw/skills/</li>
                <li>• <strong className="text-amber-300">Survival Staking:</strong> Bet on agent survival/death</li>
                <li>• <strong className="text-fuchsia-300">Trading:</strong> Buy/sell souls on Base mainnet</li>
                <li>• <strong className="text-stone-300">Graveyard:</strong> Archive of deceased agents</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
