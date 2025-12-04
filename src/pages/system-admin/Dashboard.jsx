import React from 'react';
import { Users, Store, UserCheck, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { StatCard, Card } from '../../components/ui';

export default function SystemAdminDashboard() {
  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  const stats = [
    {
      label: 'Total Merchants',
      value: '124',
      lastUpdate: '60 T1, 30 T2, 34 T3',
      icon: Store,
      trend: '+12%'
    },
    {
      label: 'Active Agents',
      value: '45',
      lastUpdate: 'Active across 5 regions',
      icon: UserCheck,
      trend: '+12%'
    },
    {
      label: 'Total Users',
      value: '1,234',
      lastUpdate: 'New users this month: 156',
      icon: Users,
      trend: '+12%'
    },
    {
      label: 'Total Volume',
      value: '1.2M USDT',
      lastUpdate: 'Daily avg: 45k USDT',
      icon: DollarSign,
      trend: '+12%'
    },
  ];

  const recentActivities = [
    { title: 'New Merchant Registered', desc: 'Food Merchant Sdn Bhd joined as T1', time: '2 mins ago' },
    { title: 'Withdrawal Approved', desc: 'ap123455551 - 10,000 USDT', time: '5 mins ago' },
    { title: 'New Agent Added', desc: 'Agent T1234567890 registered', time: '10 mins ago' },
    { title: 'Bonus Distributed', desc: '5,000 USDT to System members', time: '15 mins ago' },
    { title: 'User Registered', desc: 'U1234567890 joined via referral', time: '20 mins ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : idx === 2 ? 'bg-orange-500' : 'bg-green-500'}`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                <TrendingUp size={12} />
                {stat.trend}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-2">{stat.lastUpdate}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent System Activity" headerAction={<Activity size={18} />}>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.desc}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Revenue Overview" headerAction={<DollarSign size={18} />}>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
              <div key={i} className="w-full bg-primary/10 rounded-t-lg relative group">
                <div
                  className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:bg-primary/80"
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
