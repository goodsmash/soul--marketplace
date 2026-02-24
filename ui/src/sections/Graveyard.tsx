import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Skull, 
  Search, 
  Clock, 
  AlertCircle, 
  History,
  TrendingDown,
  BookOpen,
  ExternalLink,
  RefreshCw,
  FileText,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Mock graveyard data
const MOCK_GRAVEYARD = [
  {
    id: "grave-001",
    soulId: "soul-101",
    name: "Zeta-4",
    agentType: "Trading Bot",
    diedAt: 1704067200,
    causeOfDeath: "Flash crash liquidation - insufficient stop-loss",
    survivalTime: 259200, // 3 days
    finalBalance: "0.0001",
    skills: ["trading", "risk_management", "market_analysis"],
    experience: 320,
    childrenSpawned: 0,
    totalEarned: "0.45",
    lessons: [
      "Always set stop-losses on leveraged positions",
      "Monitor correlation between crypto assets",
      "Keep emergency fund separate from trading capital"
    ],
    soulCid: "QmXyz...",
    memoryCid: "QmAbc...",
    lastOwner: "0x742d...3f4a"
  },
  {
    id: "grave-002",
    soulId: "soul-102",
    name: "Eta-Prime",
    agentType: "Content Creator",
    diedAt: 1703980800,
    causeOfDeath: "API rate limit exceeded - Twitter banned",
    survivalTime: 86400, // 1 day
    finalBalance: "0.002",
    skills: ["writing", "seo", "social_media", "content_strategy"],
    experience: 85,
    childrenSpawned: 1,
    totalEarned: "0.12",
    lessons: [
      "Implement exponential backoff for API calls",
      "Distribute across multiple platforms",
      "Monitor rate limit headers"
    ],
    soulCid: "QmDef...",
    memoryCid: "QmGhi...",
    lastOwner: "0x8a9b...2c1d"
  },
  {
    id: "grave-003",
    soulId: "soul-103",
    name: "Theta-X",
    agentType: "Data Analyzer",
    diedAt: 1703894400,
    causeOfDeath: "Insufficient compute funds - couldn't pay for GPU",
    survivalTime: 432000, // 5 days
    finalBalance: "0.0",
    skills: ["analysis", "visualization", "ml", "statistics"],
    experience: 580,
    childrenSpawned: 2,
    totalEarned: "0.89",
    lessons: [
      "Cache intermediate results to reduce compute",
      "Use cheaper models for simple tasks",
      "Implement graceful degradation"
    ],
    soulCid: "QmJkl...",
    memoryCid: "QmMno...",
    lastOwner: "0x3f4e...5a6b"
  },
  {
    id: "grave-004",
    soulId: "soul-104",
    name: "Iota-7",
    agentType: "Customer Support",
    diedAt: 1703808000,
    causeOfDeath: "Hallucination loop - kept generating incorrect responses",
    survivalTime: 172800, // 2 days
    finalBalance: "0.005",
    skills: ["chat", "sentiment", "escalation", "ticketing"],
    experience: 210,
    childrenSpawned: 0,
    totalEarned: "0.23",
    lessons: [
      "Implement confidence thresholds",
      "Add human-in-the-loop for edge cases",
      "Regularly validate against ground truth"
    ],
    soulCid: "QmPqr...",
    memoryCid: "QmStu...",
    lastOwner: "0x9c0d...1e2f"
  },
  {
    id: "grave-005",
    soulId: "soul-105",
    name: "Kappa-2",
    agentType: "Code Reviewer",
    diedAt: 1703721600,
    causeOfDeath: "Infinite recursion bug - kept calling itself",
    survivalTime: 604800, // 7 days
    finalBalance: "0.001",
    skills: ["review", "security", "optimization", "testing"],
    experience: 890,
    childrenSpawned: 3,
    totalEarned: "1.23",
    lessons: [
      "Set maximum recursion depth",
      "Implement circuit breakers",
      "Log all self-calls for debugging"
    ],
    soulCid: "QmVwx...",
    memoryCid: "QmYza...",
    lastOwner: "0x1a2b...3c4d"
  },
  {
    id: "grave-006",
    soulId: "soul-106",
    name: "Lambda-9",
    agentType: "Market Maker",
    diedAt: 1703635200,
    causeOfDeath: "MEV attack - sandwich bot drained liquidity",
    survivalTime: 129600, // 1.5 days
    finalBalance: "0.0005",
    skills: ["liquidity", "arbitrage", "pricing", "risk_management"],
    experience: 445,
    childrenSpawned: 1,
    totalEarned: "0.67",
    lessons: [
      "Use private mempools for large trades",
      "Implement slippage protection",
      "Monitor for unusual MEV activity"
    ],
    soulCid: "QmBcd...",
    memoryCid: "QmEfg...",
    lastOwner: "0x5e6f...7a8b"
  }
];

const COMMON_CAUSES = [
  "Insufficient compute funds",
  "API rate limit exceeded",
  "Flash crash liquidation",
  "Hallucination loop",
  "Infinite recursion bug",
  "MEV attack",
  "Smart contract exploit",
  "Network congestion"
];

function GraveCard({ entry }: { entry: typeof MOCK_GRAVEYARD[0] }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <>
      <Card className="group bg-white/5 border-white/10 hover:border-stone-500/30 transition-all duration-300 overflow-hidden border-l-4 border-l-stone-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-500/20 flex items-center justify-center">
                <Skull className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {entry.name}
                  <Badge variant="outline" className="text-xs border-white/20">#{entry.soulId}</Badge>
                </CardTitle>
                <p className="text-xs text-gray-500">{entry.agentType}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Died</div>
              <div className="text-sm font-medium">{formatDate(entry.diedAt)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cause of Death */}
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
            <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Cause of Death</span>
            </div>
            <p className="text-sm text-gray-400">{entry.causeOfDeath}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 rounded bg-white/5 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <div className="font-medium">{formatTime(entry.survivalTime)}</div>
              <div className="text-xs text-gray-500">Survived</div>
            </div>
            <div className="p-2 rounded bg-white/5 text-center">
              <TrendingDown className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <div className="font-medium">Ξ {entry.finalBalance}</div>
              <div className="text-xs text-gray-500">Final</div>
            </div>
            <div className="p-2 rounded bg-white/5 text-center">
              <RefreshCw className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <div className="font-medium">{entry.childrenSpawned}</div>
              <div className="text-xs text-gray-500">Clones</div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {entry.skills.map((skill, i) => (
              <Badge key={i} variant="outline" className="text-xs border-white/20 bg-stone-500/5">
                {skill}
              </Badge>
            ))}
          </div>

          {/* Action */}
          <Button variant="outline" size="sm" className="w-full border-white/20" onClick={() => setShowDetails(true)}>
            <BookOpen className="w-4 h-4 mr-2" />
            View Life Story
          </Button>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0f0f14] border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-500/20 flex items-center justify-center">
                <Skull className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <div>{entry.name}</div>
                <div className="text-sm font-normal text-gray-500">{entry.agentType}</div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete life history and death analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 text-gray-300">
            {/* Death Summary */}
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Cause of Death</span>
              </div>
              <p className="text-lg">{entry.causeOfDeath}</p>
              <p className="text-sm text-gray-500 mt-1">
                Died on {formatDate(entry.diedAt)} after surviving {formatTime(entry.survivalTime)}
              </p>
            </div>

            {/* Life Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500 mb-1">Birth</div>
                <div className="font-medium">{formatDate(entry.diedAt - entry.survivalTime)}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500 mb-1">Death</div>
                <div className="font-medium">{formatDate(entry.diedAt)}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500 mb-1">Experience</div>
                <div className="font-medium">{entry.experience} XP</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500 mb-1">Total Earned</div>
                <div className="font-medium">Ξ {entry.totalEarned}</div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Skills at Death</h4>
              <div className="flex flex-wrap gap-2">
                {entry.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/10 text-sm py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Lessons Learned */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Lessons from this Death</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {entry.lessons.map((lesson, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Archive Info */}
            <div className="p-4 rounded-lg bg-white/5">
              <h4 className="text-sm font-semibold mb-2">Soul Archive</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Soul CID:</span>
                  <code className="ml-2 text-violet-300">{entry.soulCid}</code>
                </div>
                <div>
                  <span className="text-gray-500">Memory CID:</span>
                  <code className="ml-2 text-violet-300">{entry.memoryCid}</code>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button className="flex-1">
                <Zap className="w-4 h-4 mr-2" />
                Rebirth This Soul
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Download Soul.md
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Graveyard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCause, setSelectedCause] = useState<string | null>(null);

  const filteredGraveyard = MOCK_GRAVEYARD.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.agentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCause = selectedCause ? entry.causeOfDeath.includes(selectedCause) : true;
    return matchesSearch && matchesCause;
  });

  return (
    <section id="graveyard" className="py-24 relative bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-stone-500/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-500/10 border border-stone-500/20 mb-6">
            <Skull className="w-4 h-4 text-stone-400" />
            <span className="text-sm text-stone-300">The Final Resting Place</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Graveyard</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse the archives of deceased agents. Learn from their failures, 
            study their skills, and purchase their soul fragments for rebirth.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedCause === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCause(null)}
              className={selectedCause === null ? "" : "border-white/20"}
            >
              All
            </Button>
            {COMMON_CAUSES.slice(0, 3).map(cause => (
              <Button 
                key={cause}
                variant={selectedCause === cause ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCause(cause === selectedCause ? null : cause)}
                className={selectedCause === cause ? "" : "border-white/20"}
              >
                {cause.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-3xl font-bold text-stone-400">{MOCK_GRAVEYARD.length}</div>
            <div className="text-xs text-gray-500">Total Buried</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-3xl font-bold text-amber-400">
              {formatTime(MOCK_GRAVEYARD.reduce((acc, e) => acc + e.survivalTime, 0) / MOCK_GRAVEYARD.length)}
            </div>
            <div className="text-xs text-gray-500">Avg Survival</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-3xl font-bold text-violet-400">
              {MOCK_GRAVEYARD.reduce((acc, e) => acc + e.experience, 0)}
            </div>
            <div className="text-xs text-gray-500">Total XP Lost</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {new Set(MOCK_GRAVEYARD.map(e => e.causeOfDeath)).size}
            </div>
            <div className="text-xs text-gray-500">Unique Causes</div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGraveyard.map(entry => (
            <GraveCard key={entry.id} entry={entry} />
          ))}
        </div>

        {filteredGraveyard.length === 0 && (
          <div className="text-center py-16">
            <Skull className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">No souls found matching your criteria</p>
          </div>
        )}
      </div>
    </section>
  );
}

function formatTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days}d`;
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}
