import { Web3Provider } from './Web3Provider';
import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { MySoul } from './sections/MySoul';
import { SoulMarketplace } from './sections/SoulMarketplace';
import { SkillMarketplace } from './sections/SkillMarketplace';
import { Staking } from './sections/Staking';
import { BackupVault } from './sections/BackupVault';
import { SoulLab } from './sections/SoulLab';
import { TerminalPanel } from './sections/TerminalPanel';
import { Graveyard } from './sections/Graveyard';
import { Footer } from './sections/Footer';
import '@rainbow-me/rainbowkit/styles.css';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navigation />
        <main>
          <Hero />
          <MySoul />
          <SoulMarketplace />
          <SkillMarketplace />
          <Staking />
          <BackupVault />
          <SoulLab />
          <TerminalPanel />
          <Graveyard />
        </main>
        <Footer />
      </div>
    </Web3Provider>
  );
}

export default App;
