import { useState, useEffect } from 'react';
import { Users, Store, UserCheck, DollarSign, TrendingUp, Activity, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';

export default function SystemAdminDashboard() {
  const [currentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activitiesData, setActivitiesData] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState('week');
  const [loadingRevenue, setLoadingRevenue] = useState(false);

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

  // Fetch revenue data when period changes
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoadingRevenue(true);
        const result = await api.systemadmin.getRevenue(revenuePeriod);
        if (result && result.success) {
          setRevenueData(result.data);
        } else {
          setRevenueData(null);
        }
      } catch (error) {
        console.error('Failed to fetch revenue:', error);
        setRevenueData(null);
      } finally {
        setLoadingRevenue(false);
      }
    };
    fetchRevenue();
  }, [revenuePeriod]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  // Helper function to parse trend value
  const parseTrendValue = (trendString) => {
    if (!trendString) return 0;
    // Remove % and parse, handling + and - signs
    const cleaned = trendString.replace('%', '').trim();
    return parseFloat(cleaned) || 0;
  };

  const stats = dashboardData ? [
    {
      label: 'Total Merchants',
      value: (dashboardData.total_t1_merchants || 0) + (dashboardData.total_t2_merchants || 0) + (dashboardData.total_t3_merchants || 0),
      lastUpdate: `${dashboardData.total_t1_merchants || 0} T1, ${dashboardData.total_t2_merchants || 0} T2, ${dashboardData.total_t3_merchants || 0} T3`,
      icon: Store,
      trend: dashboardData.total_merchants_trend || '+0.0%',
      trendValue: parseTrendValue(dashboardData.total_merchants_trend)
    },
    {
      label: 'Active Agents',
      value: dashboardData.total_active_agents || 0,
      lastUpdate: 'Active agents',
      icon: UserCheck,
      trend: dashboardData.active_agents_trend || '+0.0%',
      trendValue: parseTrendValue(dashboardData.active_agents_trend)
    },
    {
      label: 'Total Users',
      value: dashboardData.total_users || 0,
      lastUpdate: 'Active users',
      icon: Users,
      trend: dashboardData.total_users_trend || '+0.0%',
      trendValue: parseTrendValue(dashboardData.total_users_trend)
    },
    {
      label: 'Total Volume',
      value: '0.00 USDT', // Based on API: total_fees_collected is 0
      lastUpdate: `${dashboardData.total_transactions || 0} transactions`,
      icon: DollarSign,
      trend: dashboardData.total_volume_trend || '0%',
      trendValue: parseTrendValue(dashboardData.total_volume_trend)
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
          Last updated: {(() => {
            // Get last updated from API response, fallback to today's date
            if (dashboardData) {
              // Try different possible field names from API
              const lastUpdated = dashboardData.last_updated || 
                                  dashboardData.updated_at || 
                                  dashboardData.last_update ||
                                  dashboardData.updated_at_date;
              
              if (lastUpdated) {
                try {
                  const date = new Date(lastUpdated);
                  if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString();
                  }
                } catch (e) {
                  console.warn('Failed to parse last_updated date:', e);
                }
              }
            }
            // Fallback to today's date
            return new Date().toLocaleDateString();
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : idx === 2 ? 'bg-orange-500' : 'bg-green-500'}`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                (stat.trendValue || 0) >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {(stat.trendValue || 0) >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingUp size={12} className="rotate-180" />
                )}
                {stat.trend}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold mt-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
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

        <Card 
          title="Revenue Overview" 
          headerAction={
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value)}
                  className="appearance-none bg-background border border-border rounded-md px-3 py-1.5 pr-8 text-sm font-medium cursor-pointer hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="today">Today</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>
              <DollarSign size={18} />
            </div>
          }
        >
          {loadingRevenue ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading revenue data...</p>
            </div>
          ) : revenueData && revenueData.chart_data && Array.isArray(revenueData.chart_data) && revenueData.chart_data.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-2xl font-bold">{(revenueData.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</p>
                <p className="text-xs text-muted-foreground mt-1">Total Revenue ({revenuePeriod})</p>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {revenueData.chart_data.map((item, i) => {
                  // Handle different data structures: value, revenue, amount, etc.
                  const value = item.value || item.revenue || item.amount || 0;
                  // Calculate max value for percentage calculation
                  const maxValue = Math.max(...revenueData.chart_data.map(d => d.value || d.revenue || d.amount || 0), 1);
                  const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  // Handle different label structures
                  const label = item.label || item.date || item.day || item.time || item.name || '';
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-primary/10 rounded-t-lg relative h-full min-h-[40px]">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:bg-primary/80"
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground truncate w-full text-center">{label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <DollarSign size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No revenue data available</p>
              <p className="text-xs text-muted-foreground mt-1">Total Revenue: {(revenueData?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
