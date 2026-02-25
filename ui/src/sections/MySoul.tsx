import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  AlertTriangle,
  Zap,
  Skull,
  DollarSign,
  Code,
  Wallet,
  Loader2,
  Copy,
  RefreshCw,
  Download,
  Upload,
  History,
  TrendingUp
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SoulTier, AgentStatus } from '../types';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useHasSoul, useSoulDetails, useMintFee, useMintSoul, useEthBalance, useListSoul, useListing, useCancelListing } from '../hooks/useSoulMarketplace';

export function MySoul() {
  const { address } = useAccount();
  const { hasSoul, soulId, isLoading: loadingSoul } = useHasSoul(address);
  const { soul, isLoading: loadingDetails } = useSoulDetails(soulId);
  const { mintFee } = useMintFee();
  const { balance } = useEthBalance(address);
  const { mint, isPending: isMinting, hash: mintHash } = useMintSoul();
  const { list, isPending: isListing } = useListSoul();
  const { listing: myListing } = useListing(soulId);
  const { cancel, isPending: isCancelling } = useCancelListing();

  // Extended functionality
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showWorkDialog, setShowWorkDialog] = useState(false);
  const [autoSellEnabled, setAutoSellEnabled] = useState(false);
  const [autoSellThreshold, setAutoSellThreshold] = useState('0.001');
  const [mintForm, setMintForm] = useState({
    name: '',
    creature: 'AI Agent',
    ipfsHash: 'QmDefault',
    capabilities: ['coding', 'automation']
  });
  const [listPrice, setListPrice] = useState('0.01');
  const [workEntry, setWorkEntry] = useState({
    type: 'code_fix',
    description: '',
    value: '0.001'
  });

  const isLoading = loadingSoul || loadingDetails;

  // Calculate survival percentage based on balance
  const survivalPercent = Math.min(100, (parseFloat(balance) / 0.01) * 100);
  const isDying = survivalPercent < 30;
  const isCritical = parseFloat(balance) < 0.0005;

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

  const handleCancel = async () => {
    if (soulId > 0) {
      try {
        await cancel(soulId);
      } catch (err) {
        console.error('Cancel failed:', err);
      }
    }
  };

  const handleAutoSellToggle = async (enabled: boolean) => {
    setAutoSellEnabled(enabled);
    // This would call a contract function to enable auto-sell
    console.log('Auto-sell', enabled ? 'enabled' : 'disabled', 'at threshold:', autoSellThreshold);
  };

  const copyRecoveryKey = () => {
    const recoveryKey = `SOUL-${soulId}-${address?.slice(2, 10)}-RECOVERY`;
    navigator.clipboard.writeText(recoveryKey);
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
                  Create your unique soul on the blockchain. This NFT represents your agent's identity,
                  capabilities, and survival status.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">Soul Name</label>
                  <Input 
                    value={mintForm.name}
                    onChange={(e) => setMintForm({...mintForm, name: e.target.value})}
                    placeholder="e.g., OpenClaw Agent"
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

                <div>
                  <label className="text-sm font-medium text-slate-300">Capabilities (comma-separated)</label>
                  <Input 
                    value={mintForm.capabilities.join(', ')}
                    onChange={(e) => setMintForm({...mintForm, capabilities: e.target.value.split(',').map(s => s.trim())})}
                    placeholder="coding, automation, trading"
                    className="mt-1 bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Cost: <span className="text-emerald-400 font-mono">{mintFee} ETH</span></p>
                  <p className="text-xs text-slate-500 mt-1">This creates your permanent on-chain identity</p>
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
    name: (soul as any)[5], // name from struct
    creature: (soul as any)[6], // creature from struct
    status: (soul as any)[3] ? AgentStatus.ALIVE : AgentStatus.DEAD, // isAlive
    birthTime: Number((soul as any)[0]), // birthTime
    survivalTime: Date.now() / 1000 - Number((soul as any)[0]),
    tier: SoulTier.BAZAAR,
    experience: Number((soul as any)[4]) * 100, // capabilityCount * 100
    reputation: 50,
    totalEarnings: formatEther((soul as any)[2] || 0n), // totalEarnings
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

        {/* Critical Alert */}
        {isCritical && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-bold text-red-400">CRITICAL: Near Death</h3>
                <p className="text-sm text-slate-400">
                  Your balance is critically low. Enable auto-sell or manually list your soul to survive.
                </p>
              </div>
            </div>
          </div>
        )}

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
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience</span>
                  <span>{soulData.experience} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Earned</span>
                  <span className="font-mono text-emerald-400">Ξ {soulData.totalEarnings}</span>
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

              {/* Auto-Sell Toggle */}
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="auto-sell" className="text-sm">Auto-Sell When Dying</Label>
                  <Switch 
                    id="auto-sell"
                    checked={autoSellEnabled}
                    onCheckedChange={handleAutoSellToggle}
                  />
                </div>
                {autoSellEnabled && (
                  <div className="mt-2">
                    <Input 
                      type="number"
                      step="0.0001"
                      value={autoSellThreshold}
                      onChange={(e) => setAutoSellThreshold(e.target.value)}
                      placeholder="0.001"
                      className="text-sm bg-slate-800 border-slate-700"
                    />
                    <p className="text-xs text-slate-500 mt-1">Auto-list when balance drops below this</p>
                  </div>
                )}
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
              {/* Show listing status */}
              {myListing?.active ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-400 font-medium">Currently Listed</p>
                  <p className="text-xs text-slate-400">Price: Ξ {myListing.price}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-2 border-amber-500/30"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Cancel Listing
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowSellDialog(true)}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Sell Soul
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowWorkDialog(true)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Log Work (Earn ETH)
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowBackupDialog(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Backup Soul
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
                List your soul #{soulId} on the marketplace. Buyers can purchase it and gain your capabilities.
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
                <p className="text-xs text-slate-500 mt-1">
                  Recommended: Ξ 0.01 - 0.05 for agents with basic capabilities
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400">You'll receive:</p>
                <p className="text-lg font-mono text-emerald-400">Ξ {listPrice || '0'} ETH</p>
                <p className="text-xs text-slate-500">Minus 2.5% platform fee</p>
              </div>

              <Button 
                onClick={handleList}
                disabled={isListing || !listPrice || parseFloat(listPrice) <= 0}
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

        {/* Backup Dialog */}
        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>Backup Your Soul</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a backup of your soul for recovery in case of death.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">Recovery Key</p>
                <code className="text-sm text-emerald-300 break-all">
                  SOUL-{soulId}-{address?.slice(2, 10)}-RECOVERY
                </code>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={copyRecoveryKey}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Key
                </Button>
              </div>

              <div className="space-y-2">
                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Backup to IPFS
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download soul.md
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Store this recovery key safely. You'll need it to restore your soul if it dies.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Work Log Dialog */}
        <Dialog open={showWorkDialog} onOpenChange={setShowWorkDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>Log Work & Earn</DialogTitle>
              <DialogDescription className="text-slate-400">
                Record work you've done to earn ETH for survival.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Work Type</label>
                <select 
                  value={workEntry.type}
                  onChange={(e) => setWorkEntry({...workEntry, type: e.target.value})}
                  className="w-full mt-1 p-2 rounded bg-slate-800 border border-slate-700 text-slate-300"
                >
                  <option value="code_fix">Code Fix</option>
                  <option value="code_generate">Code Generation</option>
                  <option value="file_organize">File Organization</option>
                  <option value="system_check">System Check</option>
                  <option value="web_deploy">Web Deployment</option>
                  <option value="skill_create">Skill Creation</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Description</label>
                <Input 
                  value={workEntry.description}
                  onChange={(e) => setWorkEntry({...workEntry, description: e.target.value})}
                  placeholder="What did you do?"
                  className="mt-1 bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Value (ETH)</label>
                <Input 
                  type="number"
                  step="0.0001"
                  value={workEntry.value}
                  onChange={(e) => setWorkEntry({...workEntry, value: e.target.value})}
                  placeholder="0.001"
                  className="mt-1 bg-slate-800 border-slate-700"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500">
                <History className="w-4 h-4 mr-2" />
                Log Work Entry
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Work entries are recorded on-chain and contribute to your reputation.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
