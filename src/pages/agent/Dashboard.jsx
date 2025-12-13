import { Users, DollarSign, TrendingUp, Network } from 'lucide-react';
import { Card } from '../../components/ui';

export default function AgentDashboard() {
  const stats = [
    { title: 'Total Bonus Available', value: '10.1234 USDT', subtext: 'Unclaimed: 5.00 USDT', icon: DollarSign, color: 'bg-green-500' },
    { title: 'Business Statistic', value: '100.5 USDT', subtext: 'Today Volume +10%', icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'Total Team L1', value: '24', subtext: 'New this month: 4', icon: Users, color: 'bg-purple-500' },
    { title: 'Total Team L2', value: '100', subtext: 'New this month: 12', icon: Network, color: 'bg-orange-500' },
  ];

  const recentTransactions = [
    { type: 'Bonus Received', from: 'u4v5...y8x9', amount: '+5.00', time: '30 mins ago' },
    { type: 'Bonus Received', from: 'u4v5...y8x9', amount: '+5.00', time: '1 hour ago' },
    { type: 'Bonus Received', from: 'u4v5...y8x9', amount: '+5.00', time: '2 hours ago' },
    { type: 'Bonus Received', from: 'u4v5...y8x9', amount: '+5.00', time: '3 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                <TrendingUp size={12} />
                +12%
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-2">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-6">Revenue Trend (USDT)</h3>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[110, 120, 115, 100, 120, 135, 125].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600 relative"
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

        <Card title="Recent Transactions">
          <div className="space-y-4">
            {recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">From: {tx.from}</p>
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
