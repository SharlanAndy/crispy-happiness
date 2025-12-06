import { TrendingUp, DollarSign, ArrowDownLeft, QrCode, Wallet, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components/ui';

export default function MerchantDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Bonus Available', value: '10.1234 USDT', lastUpdate: 'Updated 15 Nov 2025', icon: DollarSign },
    { label: 'Today Volume', value: '100.5 USDT', lastUpdate: '+10% from yesterday', icon: Activity, trend: '+10%' },
    { label: 'This Month Volume', value: '1,000.60 USDT', lastUpdate: '+15% from last month', icon: TrendingUp, trend: '+15%' },
    { label: 'Total Volume', value: '12,450.00 USDT', lastUpdate: 'Lifetime volume', icon: Wallet },
  ];

  const recentTransactions = [
    { type: 'Payment Received', wallet: 'u4v5...y8x9', amount: '+599.00', time: '30 mins ago' },
    { type: 'Payment Received', wallet: 'u4v5...y8x9', amount: '+599.00', time: '1 hour ago' },
    { type: 'Payment Received', wallet: 'u4v5...y8x9', amount: '+599.00', time: '2 hours ago' },
    { type: 'Payment Received', wallet: 'u4v5...y8x9', amount: '+599.00', time: '3 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
        <Button icon={<QrCode size={16} />} onClick={() => navigate('/merchant/invite')}>
          Receive Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <stat.icon size={24} />
              </div>
              {stat.trend && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {stat.trend}
                </span>
              )}
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-2">{stat.lastUpdate}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-6">Volume Trend (Last 7 Days)</h3>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[110, 120, 115, 100, 120, 135, 125].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:bg-primary/80 relative"
                  style={{ height: `${(h / 150) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h} USDT
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Nov {10 + i}</span>
              </div>
            ))}
          </div>
        </div>

        <Card
          title="Recent Transactions"
          headerAction={
            <button className="text-xs text-primary hover:underline" onClick={() => navigate('/merchant/transactions')}>
              View All
            </button>
          }
        >
          <div className="space-y-4">
            {recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <ArrowDownLeft size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">Wallet: {tx.wallet}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{tx.amount}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
