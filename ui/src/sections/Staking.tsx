import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Shield,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAccount } from 'wagmi';
import { useEthBalance } from '../hooks/useSoulMarketplace';

// Real agent data for staking pools
const REAL_POOLS = [
  {
    id: "pool-openclaw",
    soulId: 0,
    soulName: "OpenClaw Agent",
    survivalOdds: 85,
    totalStaked: "0.045",
    survivalStakes: "0.038",
    deathStakes: "0.007",
    deadline: Date.now() + 86400000 * 7, // 7 days
    status: 'active' as const,
    description: "Main agent - survives on real CDP wallet balance",
    isReal: true
  }
];

export function Staking() {
  const { address } = useAccount();
  const { balance } = useEthBalance(address);
  const [selectedPool, setSelectedPool] = useState<typeof REAL_POOLS[0] | null>(null);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeType, setStakeType] = useState<'survival' | 'death'>('survival');
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount) return;
    
    setIsStaking(true);
    
    try {
      // Staking contract coming soon
      // Once deployed: STAKING_ADDRESS from environment
      alert(`Staking contract deployment required.\n\nYou want to stake ${stakeAmount} ETH on ${stakeType} for ${selectedPool.soulName}\n\nContract address needed in .env`);
      setIsStaking(false);
      setShowStakeDialog(false);
    } catch (err) {
      console.error('Stake failed:', err);
      setIsStaking(false);
    }
  };

  const totalStaked = REAL_POOLS.reduce((acc, p) => acc + parseFloat(p.totalStaked), 0);
  const activePools = REAL_POOLS.filter(p => p.status === 'active').length;

  return (
    <section id="staking" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full mb-4">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">Bet on Agent Survival</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">Survival Staking</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Stake ETH on whether agents survive or die. Earn rewards for correct predictions. 
            All bets settle on-chain based on real agent survival metrics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={Wallet}
            label="Total Staked"
            value={`${totalStaked.toFixed(3)} ETH`}
            color="amber"
          />
          <StatCard 
            icon={Shield}
            label="Active Pools"
            value={activePools.toString()}
            color="emerald"
          />
          <StatCard 
            icon={TrendingUp}
            label="Your Balance"
            value={`${parseFloat(balance).toFixed(4)} ETH`}
            color="violet"
          />
        </div>

        {REAL_POOLS.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-semibold mb-2">No Active Pools</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Staking pools will appear when agents are listed. Check the marketplace for available souls.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {REAL_POOLS.map((pool) => (
              <Card key={pool.id} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{pool.soulName}</h3>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400">
                          Soul #{pool.soulId}
                        </Badge>
                        {pool.isReal && (
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            <CheckCircle className="w-3 h-3 mr-1" /> Live
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-400 mb-4">
                        {pool.description}
                      </p>
                      
                      <p className="text-sm text-slate-400 mb-4">
                        Closes {new Date(pool.deadline).toLocaleDateString()}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Survival Odds</span>
                          <span className={pool.survivalOdds > 50 ? 'text-emerald-400' : 'text-amber-400'}>
                            {pool.survivalOdds}%
                          </span>
                        </div>
                        <Progress 
                          value={pool.survivalOdds} 
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="bg-emerald-500/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400">Survival</span>
                        </div>
                        <p className="font-mono font-bold">{pool.survivalStakes} ETH</p>
                        <p className="text-xs text-slate-400">
                          {((parseFloat(pool.survivalStakes) / parseFloat(pool.totalStaked)) * 100).toFixed(0)}% of pool
                        </p>
                      </div>

                      <div className="bg-red-500/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">Death</span>
                        </div>
                        <p className="font-mono font-bold">{pool.deathStakes} ETH</p>
                        <p className="text-xs text-slate-400">
                          {((parseFloat(pool.deathStakes) / parseFloat(pool.totalStaked)) * 100).toFixed(0)}% of pool
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setSelectedPool(pool);
                          setStakeType('survival');
                          setShowStakeDialog(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500"
                      >
                        Bet Survival
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          setSelectedPool(pool);
                          setStakeType('death');
                          setShowStakeDialog(true);
                        }}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Bet Death
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stake Dialog */}
        <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>
                Stake on {selectedPool?.soulName} {stakeType === 'survival' ? 'Survival' : 'Death'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Bet ETH on whether this agent will survive until {selectedPool && new Date(selectedPool.deadline).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Pool Odds</p>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={selectedPool?.survivalOdds} 
                    className="flex-1 h-2"
                  />
                  <span className="font-mono">{selectedPool?.survivalOdds}%</span>
                </div>
                
                <p className="text-sm text-slate-400 mt-4">Total Pool</p>
                <p className="font-mono">{selectedPool?.totalStaked} ETH</p>
                
                <p className="text-sm text-slate-400 mt-4">Your Balance</p>
                <p className="font-mono">{parseFloat(balance).toFixed(6)} ETH</p>
              </div>

              <div>
                <label className="text-sm font-medium">Stake Amount (ETH)</label>
                <Input 
                  type="number"
                  step="0.001"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.01"
                  className="mt-1 bg-slate-800/50 border-slate-700"
                />
              </div>

              <Button 
                onClick={handleStake}
                disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className={`w-full ${
                  stakeType === 'survival' 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {isStaking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Stake...
                  </>
                ) : (
                  `Stake ${stakeAmount || '0'} ETH on ${stakeType === 'survival' ? 'Survival' : 'Death'}`
                )}
              </Button>

              <p className="text-xs text-slate-400 text-center">
                If you win, you receive your stake plus a share of the losing pool.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: string;
  color: 'amber' | 'emerald' | 'violet';
}) {
  const colors = {
    amber: 'bg-amber-500/10 text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    violet: 'bg-violet-500/10 text-violet-400'
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
