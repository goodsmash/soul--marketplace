import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, GitCompare, Terminal, FileArchive } from 'lucide-react';

async function sha256(text: string) {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function SoulLab() {
  const [oldSoul, setOldSoul] = useState('');
  const [newSoul, setNewSoul] = useState('');
  const [oldHash, setOldHash] = useState('');
  const [newHash, setNewHash] = useState('');
  const [terminalUrl, setTerminalUrl] = useState((import.meta as any).env?.VITE_TERMINAL_URL || '');

  const changed = useMemo(() => oldSoul && newSoul && oldHash !== newHash, [oldSoul, newSoul, oldHash, newHash]);

  const loadFile = async (f: File, target: 'old'|'new') => {
    const txt = await f.text();
    const h = await sha256(txt);
    if (target === 'old') { setOldSoul(txt); setOldHash(h); }
    else { setNewSoul(txt); setNewHash(h); }
  };

  const downloadText = (name: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const template = `# SOUL.md\n\nName: OpenClaw Agent\nStatus: ALIVE\n\nCapabilities:\n- file_management\n- code_generation\n- survival\n`;

  return (
    <section id="soul-lab" className="py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Soul Lab (Real File Ops)</h2>
          <p className="text-slate-400">Upload old/new SOUL files, compare hashes, download templates, and connect web terminal.</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader><CardTitle className="flex items-center gap-2"><GitCompare className="w-5 h-5"/>Old vs New Soul Compare</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Upload OLD SOUL.md</label>
                <Input type="file" onChange={(e)=>e.target.files?.[0] && loadFile(e.target.files[0],'old')} />
                {oldHash && <Badge variant="outline" className="mt-2">old: {oldHash.slice(0,16)}...</Badge>}
              </div>
              <div>
                <label className="text-sm text-slate-400">Upload NEW SOUL.md</label>
                <Input type="file" onChange={(e)=>e.target.files?.[0] && loadFile(e.target.files[0],'new')} />
                {newHash && <Badge variant="outline" className="mt-2">new: {newHash.slice(0,16)}...</Badge>}
              </div>
            </div>
            <div className="text-sm">
              {oldHash && newHash ? (
                changed ? <span className="text-amber-400">Files differ — ready to upload new + archive old.</span>
                        : <span className="text-emerald-400">Files identical.</span>
              ) : <span className="text-slate-400">Upload both files to compare.</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileArchive className="w-5 h-5"/>Download / Upload Test Files</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={()=>downloadText('SOUL.template.md', template)}><Download className="w-4 h-4 mr-2"/>Download SOUL Template</Button>
            <Button variant="outline"><Upload className="w-4 h-4 mr-2"/>Use Backup Vault to Upload Real Files</Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader><CardTitle className="flex items-center gap-2"><Terminal className="w-5 h-5"/>Web Terminal (Ubuntu)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={terminalUrl} onChange={(e)=>setTerminalUrl(e.target.value)} placeholder="https://your-terminal.example.com" />
            <p className="text-sm text-slate-400">Install ttyd with infra/scripts/install_web_terminal.sh, then expose securely.</p>
            {terminalUrl ? (
              <iframe title="terminal" src={terminalUrl} className="w-full h-[420px] rounded border border-slate-700 bg-black" />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
