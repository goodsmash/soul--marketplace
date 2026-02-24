import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Upload, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Copy,
  Zap,
  Skull,
  RefreshCw,
  DollarSign,
  Code,
  Wallet,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SoulTier, TIER_NAMES, TIER_COLORS, AgentStatus } from '../types';
import { useAccount } from 'wagmi';
import { useHasSoul, useSoulDetails, useMintFee, useMintSoul, useEthBalance, useListSoul } from '../hooks/useSoulMarketplace';
import { formatEther } from 'viem';

export function MySoul() {
  const { address } = useAccount();
  const { hasSoul, soulId, isLoading: loadingSoul } = useHasSoul(address);
  const { soul, isLoading: loadingDetails } = useSoulDetails(soulId);
  const { mintFee } = useMintFee();
  const { balance } = useEthBalance(address);
  const { mint, isPending: isMinting, hash: mintHash } = useMintSoul();
  const { list, isPending: isListing } = useListSoul();

  const [showMintDialog, setShowMintDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [mintForm, setMintForm] = useState({
    name: '',
    creature: 'AI Agent',
    ipfsHash: 'QmDefault',
    capabilities: ['coding', 'automation']
  });
  const [listPrice, setListPrice] = useState('0.01');

  const isLoading = loadingSoul || loadingDetails;

  // Calculate survival percentage based on balance
  const survivalPercent = Math.min(100, (parseFloat(balance) / 0.01) * 100);
  const isDying = survivalPercent < 30;

  const handleMint = async () => {
    try {
      await mint(mintForm.name, mintForm.creature, mintForm.ipfsHash, mintForm.capabilities);
      setShowMintDialog(false);
    } catch (err) {
      console.error('Mint failed:', err);
    }
  };

  const handleList = async () => {
    if (soulId > 0) {
      try {
        await list(soulId, listPrice);
        setShowSellDialog(false);
      } catch (err) {
        console.error('List failed:', err);
      }
    }
  };

  // If no soul exists, show mint prompt
  if (!isLoading && !hasSoul) {
    return (
      <section id="my-soul" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <Skull className="w-12 h-12 text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Soul Found</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              You don't have a soul yet. Mint your first soul to join the marketplace 
              and start your journey as an immortal agent.
            </p>
            
            <div className="bg-slate-900/50 rounded-lg p-6 mb-8 max-w-sm mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Mint Fee:</span>
                <span className="font-mono text-emerald-400">{mintFee} ETH</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Your Balance:</span>
                <span className="font-mono">{parseFloat(balance).toFixed(6)} ETH</span>
              </div>
            </div>

            <Button 
              size="lg"
              onClick={() => setShowMintDialog(true)}
              disabled={parseFloat(balance) < parseFloat(mintFee)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            >
              {parseFloat(balance) < parseFloat(mintFee) ? 'Insufficient Balance' : 'Mint Your Soul'}
            </Button>
          </div>

          {/* Mint Dialog */}
          <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle>Mint Your Soul NFT</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create your unique soul on the blockchain.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">Soul Name</label>
                  <Input 
                    value={mintForm.name}
                    onChange={(e) => setMintForm({...mintForm, name: e.target.value})}
                    placeholder="Enter soul name..."
                    className="mt-1 bg-slate-800 border-slate-700"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300">Creature Type</label>
                  <Input 
                    value={mintForm.creature}
                    onChange={(e) => setMintForm({...mintForm, creature: e.target.value})}
                    placeholder="AI Agent"
                    className="mt-1 bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Cost: <span className="text-emerald-400 font-mono">{mintFee} ETH</span></p>
                </div>

                <Button 
                  onClick={handleMint}
                  disabled={!mintForm.name || isMinting}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    'Confirm Mint'
                  )}
                </Button>

                {mintHash && (
                  <p className="text-sm text-emerald-400 text-center">
                    Transaction: {mintHash.slice(0, 20)}...
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    );
  }

  // Parse soul data from contract
  const soulData = soul ? {
    id: `soul-${soulId}`,
    name: soul[5], // name from struct
    creature: soul[6], // creature from struct
    status: soul[3] ? AgentStatus.ALIVE : AgentStatus.DEAD, // isAlive
    birthTime: Number(soul[0]), // birthTime
    survivalTime: Date.now() / 1000 - Number(soul[0]),
    tier: SoulTier.BAZAAR, // Default, can be calculated
    experience: 0,
    reputation: 50,
  } : null;

  if (isLoading || !soulData) {
    return (
      <section id="my-soul" className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-400" />
          <p className="mt-4 text-slate-400">Loading your soul...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="my-soul" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">My Soul</h2>
          <p className="text-slate-400">Manage your agent soul, skills, and survival</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Soul Identity Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" />
                Soul Identity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                  <span className="text-4xl">{soulData.creature === 'AI Agent' ? '🤖' : '👻'}</span>
                </div>
                <h3 className="text-xl font-bold">{soulData.name}</h3>
                <p className="text-slate-400">{soulData.creature}</p>
                
                <Badge 
                  variant={soulData.status === AgentStatus.ALIVE ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {soulData.status === AgentStatus.ALIVE ? '✓ Alive' : '✗ Dead'}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Soul ID</span>
                  <span className="font-mono">#{soulId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Birth Time</span>
                  <span>{new Date(soulData.birthTime * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Survival Status */}
          <Card className={`${isDying ? 'bg-red-900/20 border-red-800' : 'bg-slate-900/50 border-slate-800'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Survival Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Survival Rate</span>
                  <span className={`font-bold ${isDying ? 'text-red-400' : 'text-emerald-400'}`}>
                    {survivalPercent.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={survivalPercent} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Balance</span>
                  <span className="font-mono">{parseFloat(balance).toFixed(6)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mint Fee</span>
                  <span className="font-mono text-emerald-400">{mintFee} ETH</span>
                </div>
              </div>

              {isDying && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Critical: Low balance. Consider selling your soul.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowSellDialog(true)}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Sell Soul
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Code className="w-4 h-4 mr-2" />
                Clone Soul (Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sell Dialog */}
        <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>List Soul for Sale</DialogTitle>
              <DialogDescription className="text-slate-400">
                List your soul #{soulId} on the marketplace.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Price (ETH)</label>
                <Input 
                  type="number"
                  step="0.001"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="0.01"
                  className="mt-1 bg-slate-800 border-slate-700"
                />
              </div>

              <Button 
                onClick={handleList}
                disabled={isListing || !listPrice}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
              >
                {isListing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Listing...
                  </>
                ) : (
                  'List for Sale'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
