import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Sparkles, 
  FileText, 
  ShoppingBag, 
  Code, 
  Skull,
  Zap
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const navItems = [
  { name: 'My Soul', href: '#my-soul', icon: FileText },
  { name: 'Souls', href: '#marketplace', icon: ShoppingBag },
  { name: 'Skills', href: '#skills', icon: Code },
  { name: 'Staking', href: '#staking', icon: Zap },
  { name: 'Graveyard', href: '#graveyard', icon: Skull },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-white/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a 
              href="#" 
              className="flex items-center gap-2"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">Soul Marketplace</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Connect Wallet */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <ConnectButton 
                  chainStatus="icon"
                  accountStatus="avatar"
                  showBalance={false}
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-[#0a0a0f] border-b border-white/10 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span>{item.name}</span>
                </button>
              ))}
              <div className="pt-2 border-t border-white/10">
                <ConnectButton 
                  chainStatus="full"
                  accountStatus="full"
                  showBalance={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
