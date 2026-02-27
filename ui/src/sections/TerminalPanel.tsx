import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Terminal, ExternalLink } from 'lucide-react';

export function TerminalPanel() {
  const [url, setUrl] = useState((import.meta as any).env?.VITE_TERMINAL_URL || '');
  return (
    <section id="terminal" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Terminal className="w-5 h-5"/>Ubuntu Web Terminal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input name="terminal_url" autoComplete="off" aria-label="Terminal URL" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://terminal.yourdomain" />
            <p className="text-sm text-slate-400">Use infra/scripts/install_web_terminal.sh on Oracle VM, then expose via secure reverse proxy.</p>
            {url && (
              <div className="space-y-2">
                <a href={url} target="_blank" className="inline-flex items-center text-violet-300 text-sm"><ExternalLink className="w-4 h-4 mr-1"/>Open in new tab</a>
                <iframe src={url} title="terminal" className="w-full h-[520px] rounded border border-slate-700 bg-black" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
