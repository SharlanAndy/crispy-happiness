import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Share2, Download } from 'lucide-react';
import { Card, FormField, Button, PageHeader } from '../../components/ui';

export default function MerchantInvite() {
  const [amount, setAmount] = useState('');
  const [qrType, setQrType] = useState('custom');
  const [qrData, setQrData] = useState('');
  const [walletAddress] = useState('0x32Be3d4E5F67890123456789ABCDEF0dSC53');
  const qrRef = useRef(null);

  const handleGenerateQR = () => {
    // Generate QR code data based on type
    const qrValue = qrType === 'fixed' && amount
      ? `ethereum:${walletAddress}?value=${parseFloat(amount) * 1e18}`
      : walletAddress;
    setQrData(qrValue);
    console.log('QR Code generated:', qrValue);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    console.log('Wallet address copied to clipboard');
    // TODO: Show toast notification
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment QR Code',
          text: `Send payment to: ${walletAddress}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
      console.log('Share not supported, copied to clipboard instead');
    }
  };

  const handleSave = () => {
    if (!qrData) {
      console.log('Generate QR code first');
      return;
    }

    // Create SVG data URL
    const svg = qrRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `payment-qr-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
      console.log('QR code saved');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Receive Payment" description="Scan the QR Code with your crypto wallet (MetaMask, Trust Wallet, etc.)" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="flex p-1 bg-secondary rounded-lg mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${qrType === 'custom' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setQrType('custom')}
            >
              Custom QR
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${qrType === 'fixed' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setQrType('fixed')}
            >
              Fixed Amount QR
            </button>
          </div>

          <div className="space-y-4">
            <FormField label="Currency">
              <div className="w-full px-3 py-2 rounded-md border bg-secondary/50 text-muted-foreground">
                USDT (Tether) - BEP20
              </div>
            </FormField>

            {qrType === 'fixed' && (
              <FormField label="Amount (USDT)">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  placeholder="0.00"
                />
              </FormField>
            )}

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fees</span>
                <span>0.00 USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fees</span>
                <span>0.10 USDT</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total Amount</span>
                <span>{amount ? parseFloat(amount).toFixed(2) : '0.00'} USDT</span>
              </div>
            </div>

            <Button onClick={handleGenerateQR} className="w-full">Generate QR Code</Button>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border mb-6">
            {qrData ? (
              <QRCodeSVG
                value={qrData}
                size={192}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                <QrCode size={64} />
              </div>
            )}
          </div>

          <div className="text-center space-y-1 mb-6">
            <p className="font-medium">NBN Business</p>
            <p className="text-xs text-muted-foreground font-mono">Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</p>
          </div>

          <div className="flex gap-4 w-full mb-4">
            <Button onClick={handleCopy} variant="secondary" icon={<Copy size={16} />} className="flex-1">Copy</Button>
            <Button onClick={handleShare} variant="secondary" icon={<Share2 size={16} />} className="flex-1">Share</Button>
            <Button onClick={handleSave} variant="secondary" icon={<Download size={16} />} className="flex-1">Save</Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Refreshes automatically every 60 seconds
          </p>
        </Card>
      </div>
    </div>
  );
}
