import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Shield, Link2, CheckCircle, Loader2 } from 'lucide-react';
import { useAccount, useSendTransaction } from 'wagmi';
import { stringToHex } from 'viem';

async function sha256Hex(data: Uint8Array) {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  const hash = await crypto.subtle.digest('SHA-256', copy as unknown as BufferSource);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function BackupVault() {
  const { address, isConnected } = useAccount();
  const [jwt, setJwt] = useState(localStorage.getItem('pinata_jwt') || '');
  const [files, setFiles] = useState<File[]>([]);
  const [cid, setCid] = useState('');
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [anchorTx, setAnchorTx] = useState('');

  const { sendTransactionAsync } = useSendTransaction();

  const uploadReal = async () => {
    if (!jwt || files.length === 0) return;
    setLoading(true);
    setGatewayOk(null);
    try {
      localStorage.setItem('pinata_jwt', jwt);

      const packedFiles = [] as any[];
      for (const f of files) {
        const buf = new Uint8Array(await f.arrayBuffer());
        const hash = await sha256Hex(buf);
        packedFiles.push({
          name: f.name,
          type: f.type || 'application/octet-stream',
          size: f.size,
          sha256: hash,
          base64: btoa(String.fromCharCode(...buf)),
        });
      }

      const payload = {
        kind: 'soul-backup-bundle',
        createdAt: new Date().toISOString(),
        wallet: address || null,
        files: packedFiles,
      };

      const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          pinataMetadata: { name: `soul-backup-${Date.now()}` },
          pinataContent: payload,
        }),
      });

      if (!res.ok) throw new Error(`Pinata error ${res.status}`);
      const json = await res.json();
      const ipfs = json.IpfsHash as string;
      setCid(ipfs);

      const gw = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfs}`);
      setGatewayOk(gw.ok);
    } catch (e) {
      console.error(e);
      alert('Upload failed. Check JWT and file size.');
    } finally {
      setLoading(false);
    }
  };

  const anchorOnchain = async () => {
    if (!isConnected || !address || !cid) return;
    try {
      const data = stringToHex(`SOUL_BACKUP:${cid}`);
      const hash = await sendTransactionAsync({
        to: address,
        value: 0n,
        data,
      });
      setAnchorTx(hash);
    } catch (e) {
      console.error(e);
      alert('Anchor tx failed');
    }
  };

  return (
    <section id="backups" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Backup Vault (Real IPFS)</h2>
        <p className="text-slate-400 mb-6">Upload your actual SOUL/MEMORY files to IPFS, verify retrieval, then anchor CID onchain.</p>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400"/> Real Backup Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Pinata JWT (stored in browser localStorage)</label>
              <Input name="pinata_jwt" autoComplete="off" aria-label="Pinata JWT" value={jwt} onChange={(e) => setJwt(e.target.value)} placeholder="eyJ..." className="mt-1 bg-slate-800 border-slate-700" />
            </div>

            <div>
              <label className="text-sm text-slate-400">Select actual files (SOUL.md, MEMORY.md, etc.)</label>
              <Input name="backup_files" aria-label="Backup files upload" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-1 bg-slate-800 border-slate-700" />
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map(f => <Badge key={f.name} variant="outline">{f.name} ({f.size}b)</Badge>)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={uploadReal} disabled={loading || !jwt || files.length === 0}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>}
                Upload to IPFS
              </Button>
              <Button variant="outline" onClick={anchorOnchain} disabled={!cid || !isConnected}>
                <Link2 className="w-4 h-4 mr-2"/> Anchor CID Onchain
              </Button>
            </div>

            {cid && (
              <div className="p-3 rounded bg-slate-800/50 space-y-2">
                <div className="text-sm">CID: <code>{cid}</code></div>
                <div className="text-sm">Gateway: <a className="text-violet-300" href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank">open</a></div>
                <div className="text-sm">Retrieval: {gatewayOk === null ? 'not checked' : gatewayOk ? 'OK' : 'FAILED'}</div>
              </div>
            )}

            {anchorTx && (
              <div className="p-3 rounded bg-emerald-900/20 border border-emerald-700/30 text-sm">
                <CheckCircle className="inline w-4 h-4 mr-2"/> Onchain anchor tx: <code>{anchorTx}</code>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
