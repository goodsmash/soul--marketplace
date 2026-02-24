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
  Star,
  ExternalLink,
  Upload,
  CheckCircle
} from 'lucide-react';
import { SkillCategory, SKILL_CATEGORIES } from '../types';
import type { SkillCategoryType } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Mock skills from ClawHub
const MOCK_SKILLS = [
  {
    id: "skill-001",
    name: "web-scraping",
    slug: "web-scraping",
    description: "Advanced web scraping with Puppeteer and FireCrawl. Handle JavaScript, pagination, and anti-bot measures.",
    version: "3.2.1",
    author: "Alpha-7",
    category: SkillCategory.AUTOMATION,
    installs: 2341,
    rating: 4.8,
    reviews: 156,
    price: "0.01",
    isPremium: true,
    minOpenclawVersion: "2.0.0",
    dependencies: ["smooth-browser"]
  },
  {
    id: "skill-002",
    name: "vercel-deploy",
    slug: "vercel-deploy",
    description: "Deploy applications to Vercel with automatic preview deployments and production promotion.",
    version: "2.5.0",
    author: "Beta-Prime",
    category: SkillCategory.DEVOPS,
    installs: 1892,
    rating: 4.9,
    reviews: 203,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: []
  },
  {
    id: "skill-003",
    name: "telegram-bot",
    slug: "telegram-bot",
    description: "Create and manage Telegram bots with webhook support, commands, and message handling.",
    version: "1.8.2",
    author: "Gamma-X",
    category: SkillCategory.COMMUNICATION,
    installs: 3421,
    rating: 4.7,
    reviews: 289,
    price: "0.005",
    isPremium: true,
    minOpenclawVersion: "2.1.0",
    dependencies: []
  },
  {
    id: "skill-004",
    name: "security-audit",
    slug: "security-audit",
    description: "Comprehensive security auditing for code, dependencies, and configurations.",
    version: "4.0.0",
    author: "Omega-One",
    category: SkillCategory.SECURITY,
    installs: 1234,
    rating: 4.9,
    reviews: 89,
    price: "0.02",
    isPremium: true,
    minOpenclawVersion: "2.2.0",
    dependencies: ["skill-scanner"]
  },
  {
    id: "skill-005",
    name: "gpt-prompts",
    slug: "gpt-prompts",
    description: "Curated collection of effective prompts for various tasks and use cases.",
    version: "5.1.0",
    author: "Delta-3",
    category: SkillCategory.AI,
    installs: 5678,
    rating: 4.6,
    reviews: 423,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: []
  },
  {
    id: "skill-006",
    name: "shadcn-ui",
    slug: "shadcn-ui",
    description: "Build beautiful UIs with shadcn/ui components, Tailwind CSS, and Radix primitives.",
    version: "2.3.1",
    author: "Epsilon-9",
    category: SkillCategory.WEB,
    installs: 4521,
    rating: 4.8,
    reviews: 312,
    price: "0.008",
    isPremium: true,
    minOpenclawVersion: "2.0.0",
    dependencies: []
  },
  {
    id: "skill-007",
    name: "docker-ctl",
    slug: "docker-ctl",
    description: "Manage Docker containers, images, and volumes with simple commands.",
    version: "1.5.0",
    author: "Zeta-4",
    category: SkillCategory.DEVOPS,
    installs: 2134,
    rating: 4.5,
    reviews: 134,
    price: "0",
    isPremium: false,
    minOpenclawVersion: "2.0.0",
    dependencies: []
  },
  {
    id: "skill-008",
    name: "tavily-search",
    slug: "tavily-search",
    description: "AI-optimized web search using Tavily API with full content extraction.",
    version: "2.0.0",
    author: "Theta-X",
    category: SkillCategory.RESEARCH,
    installs: 1876,
    rating: 4.7,
    reviews: 98,
    price: "0.003",
    isPremium: true,
    minOpenclawVersion: "2.1.0",
    dependencies: []
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

function SkillCard({ skill }: { skill: typeof MOCK_SKILLS[0] }) {
  const [showDetails, setShowDetails] = useState(false);
  const CategoryIcon = CATEGORY_ICONS[skill.category as SkillCategoryType];

  return (
    <>
      <Card className="group bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                <p className="text-xs text-gray-500">v{skill.version} by {skill.author}</p>
              </div>
            </div>
            {skill.isPremium ? (
              <Badge className="bg-amber-500/20 text-amber-400">Premium</Badge>
            ) : (
              <Badge className="bg-emerald-500/20 text-emerald-400">Free</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400 line-clamp-2">{skill.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-400">
              <Download className="w-4 h-4" />
              <span>{skill.installs.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{skill.rating}</span>
            </div>
            <div className="text-gray-500">({skill.reviews})</div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">{SKILL_CATEGORIES[skill.category as SkillCategoryType]?.name}</span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <div className="text-xs text-gray-500">Price</div>
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
        <DialogContent className="bg-[#0f0f14] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div>{skill.name}</div>
                <div className="text-sm font-normal text-gray-500">v{skill.version} by {skill.author}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-gray-300">
            <p className="text-gray-400">{skill.description}</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <div className="text-2xl font-bold">{skill.installs.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Installs</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <div className="text-2xl font-bold text-amber-400">{skill.rating}</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <div className="text-2xl font-bold">{skill.reviews}</div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Category</div>
                <div className="font-medium flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4" />
                  {SKILL_CATEGORIES[skill.category as SkillCategoryType]?.name}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-gray-500">Min OpenClaw</div>
                <div className="font-medium">{skill.minOpenclawVersion}</div>
              </div>
            </div>

            {skill.dependencies.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Dependencies</div>
                <div className="flex flex-wrap gap-2">
                  {skill.dependencies.map((dep, i) => (
                    <Badge key={i} variant="outline" className="border-white/20">{dep}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <div className="text-xs text-gray-500">Price</div>
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
  const skills = MOCK_SKILLS.filter(s => s.category === category);
  const CategoryIcon = CATEGORY_ICONS[category];
  const categoryInfo = SKILL_CATEGORIES[category];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <CategoryIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{categoryInfo?.name}</h3>
          <p className="text-sm text-gray-500">{skills.length} skills available</p>
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
          <p className="text-gray-400 max-w-2xl mx-auto">
            Buy and sell skills for your OpenClaw agent. Install directly to 
            <code className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">~/.openclaw/skills/</code>
          </p>
        </div>

        {/* Search & Upload */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
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
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 md:grid-cols-8 mb-8 bg-white/5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="web">Web</TabsTrigger>
            <TabsTrigger value="devops">DevOps</TabsTrigger>
            <TabsTrigger value="automation">Auto</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="communication">Comm</TabsTrigger>
            <TabsTrigger value="security">Sec</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MOCK_SKILLS.map(skill => (
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
          
          <TabsContent value="research">
            <CategorySection category={SkillCategory.RESEARCH} />
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
        </Tabs>
      </div>

      {/* Upload Skill Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="bg-[#0f0f14] border-white/10">
          <DialogHeader>
            <DialogTitle>Publish Skill to ClawHub</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your skill with the OpenClaw community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Skill Name</label>
              <Input placeholder="my-awesome-skill" className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description</label>
              <Input placeholder="What does this skill do?" className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Category</label>
              <select className="w-full p-2 rounded bg-white/5 border border-white/10 text-gray-300">
                <option>Web & Frontend</option>
                <option>DevOps & Cloud</option>
                <option>Automation</option>
                <option>Research</option>
                <option>Communication</option>
                <option>Security</option>
                <option>AI & ML</option>
                <option>Tools</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Price (ETH, 0 for free)</label>
              <Input placeholder="0.01" className="bg-white/5 border-white/10" />
            </div>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">Upload SKILL.md and skill files</p>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500">Publish Skill</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
