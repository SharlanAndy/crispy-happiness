import { useState, useEffect } from 'react';
import { Users, Store, UserCheck, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';

export default function SystemAdminDashboard() {
  const [currentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activitiesData, setActivitiesData] = useState([]);

  // Helper function to convert timestamp to relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle different timestamp formats
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      console.error('Error parsing timestamp:', timestamp, error);
      return 'Unknown';
    }
  };

  // Fetch dashboard data and activities
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashboardResult, activitiesResult] = await Promise.all([
          api.systemadmin.getDashboard(),
          api.systemadmin.getActivities({ limit: 20 }) // Fetch more to ensure we get the latest 5 after sorting
        ]);

        if (dashboardResult && dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        } else {
          setDashboardData(null);
        }

        if (activitiesResult && activitiesResult.success) {
          // Sort by created_at descending (latest first), then transform
          const sorted = [...activitiesResult.data].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA; // Descending order (newest first)
          });

          // Take only the latest 5 after sorting
          const latest5 = sorted.slice(0, 5);

          // Transform API data to match UI format
          const transformed = latest5.map(activity => ({
            title: activity.title || 'System Activity',
            desc: activity.description || '',
            time: getRelativeTime(activity.created_at),
            created_at: activity.created_at, // Keep for reference
            rawData: activity // Keep raw data for reference
          }));
          setActivitiesData(transformed);
        } else {
          setActivitiesData([]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        setDashboardData(null);
        setActivitiesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  const stats = dashboardData ? [
    {
      label: 'Total Merchants',
      value: (dashboardData.total_t1_merchants + dashboardData.total_t2_merchants + dashboardData.total_t3_merchants).toString(),
      lastUpdate: `${dashboardData.total_t1_merchants} T1, ${dashboardData.total_t2_merchants} T2, ${dashboardData.total_t3_merchants} T3`,
      icon: Store,
      trend: '+12%'
    },
    {
      label: 'Active Agents',
      value: dashboardData.total_active_agents?.toString() || '0',
      lastUpdate: 'Active agents',
      icon: UserCheck,
      trend: '+12%'
    },
    {
      label: 'Total Users',
      value: dashboardData.total_users?.toString() || '0',
      lastUpdate: 'Active users',
      icon: Users,
      trend: '+12%'
    },
    {
      label: 'Total Volume',
      value: `${(dashboardData.total_fees_collected || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
      lastUpdate: `${dashboardData.total_transactions || 0} transactions`,
      icon: DollarSign,
      trend: '+12%'
    },
  ] : [
    {
      label: 'Total Merchants',
      value: '0',
      lastUpdate: 'No data',
      icon: Store,
      trend: '+0%'
    },
    {
      label: 'Active Agents',
      value: '0',
      lastUpdate: 'No data',
      icon: UserCheck,
      trend: '+0%'
    },
    {
      label: 'Total Users',
      value: '0',
      lastUpdate: 'No data',
      icon: Users,
      trend: '+0%'
    },
    {
      label: 'Total Volume',
      value: '0 USDT',
      lastUpdate: 'No data',
      icon: DollarSign,
      trend: '+0%'
    },
  ];

  // Use API data if available, otherwise show empty state
  const recentActivities = activitiesData.length > 0 
    ? activitiesData 
    : [];

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
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Loading activities...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, i) => (
                <div key={activity.rawData?.id || i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No recent activities</p>
              </div>
            )}
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
