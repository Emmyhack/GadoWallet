import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import QRCode from 'qrcode';

export function Receive() {
  const { publicKey } = useWallet();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const render = async () => {
      if (publicKey && canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, publicKey.toBase58(), { width: 200, margin: 1 });
      }
    };
    render();
  }, [publicKey]);

  const copy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Connect your wallet to receive funds</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Receive SOL / Tokens</h3>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Your Address</div>
            <div className="font-mono text-sm break-all text-gray-900">{publicKey.toBase58()}</div>
            <button onClick={copy} className="btn-secondary mt-2">Copy Address</button>
          </div>
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-lg border gradient-border bg-white">
              <canvas ref={canvasRef} className="block" width={200} height={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}