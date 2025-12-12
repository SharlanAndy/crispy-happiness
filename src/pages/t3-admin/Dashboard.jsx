import { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, PageHeader, StatCard } from '@/components/ui';
import { t3Service } from '@/services/t3Service';
import { api } from '@/lib/api';

export default function T3AdminDashboard() {
  const [currentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly'); // 'daily', 'weekly', 'monthly', 'yearly'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [weeklyFundsData, setWeeklyFundsData] = useState(null);
  const [loadingWeeklyFunds, setLoadingWeeklyFunds] = useState(false);

  // Calculate start date based on period from today
  const calculateStartDate = (period) => {
    const today = new Date();
    const startDate = new Date(today);
    
    switch (period) {
      case 'daily':
        // Today (or you could use yesterday: startDate.setDate(today.getDate() - 1))
        break;
      case 'weekly':
        // 7 days ago
        startDate.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        // 30 days ago (approximately 1 month)
        startDate.setDate(today.getDate() - 30);
        break;
      case 'yearly':
        // 365 days ago (1 year)
        startDate.setDate(today.getDate() - 365);
        break;
      default:
        startDate.setDate(today.getDate() - 7); // Default to weekly
    }
    
    return startDate;
  };

  // Format date for display (e.g., "14 Nov 2025")
  const formatDateForDisplay = (date) => {
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Get the calculated start date based on selected period
  const selectedStartDate = useMemo(() => {
    return calculateStartDate(selectedPeriod);
  }, [selectedPeriod]);

  // Format the start date for display
  const selectedStartDateFormatted = useMemo(() => {
    return formatDateForDisplay(selectedStartDate);
  }, [selectedStartDate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await t3Service.getDashboard();
        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Fetch weekly funds data
  useEffect(() => {
    const fetchWeeklyFunds = async () => {
      try {
        setLoadingWeeklyFunds(true);
        const result = await api.t3admin.getWeeklyFunds();
        if (result && result.success) {
          setWeeklyFundsData(result.data);
        } else {
          setWeeklyFundsData(null);
        }
      } catch (error) {
        console.error('Failed to fetch weekly funds:', error);
        setWeeklyFundsData(null);
      } finally {
        setLoadingWeeklyFunds(false);
      }
    };
    fetchWeeklyFunds();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  // Format stats from API data
  const stats = useMemo(() => {
    if (!dashboardData) {
      return [
        { label: 'Total Incoming Funds', value: '0.00 USDT', type: 'default' },
        { label: 'Total Outgoing Funds', value: '0.00 USDT', type: 'outgoing' },
        { label: 'Monthly Incoming Funds', value: '0.00 USDT', type: 'outgoing' },
        { label: 'Monthly Outgoing Funds', value: '0.00 USDT', type: 'outgoing' },
      ];
    }
    
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };

    return [
      { label: 'Total Incoming Funds', value: `${formatCurrency(dashboardData.total_incoming_funds || 0)} USDT`, type: 'default' },
      { label: 'Total Outgoing Funds', value: `${formatCurrency(dashboardData.total_outgoing_funds || 0)} USDT`, type: 'outgoing' },
      { label: 'Monthly Incoming Funds', value: `${formatCurrency(dashboardData.monthly_incoming_funds || 0)} USDT`, type: 'outgoing' },
      { label: 'Monthly Outgoing Funds', value: `${formatCurrency(dashboardData.monthly_outgoing_funds || 0)} USDT`, type: 'outgoing' },
    ];
  }, [dashboardData]);

  // Transform API data to chart format
  const weeklyChartData = useMemo(() => {
    // If API data is available and has the expected structure
    // API response: { success: true, data: { data: { incoming, outgoing } } }
    if (weeklyFundsData) {
      const fundsData = weeklyFundsData.data || weeklyFundsData;
      const incoming = fundsData?.incoming;
      const outgoing = fundsData?.outgoing;
      
      // Check if both are null (API returns null values)
      if (incoming === null && outgoing === null) {
        return [];
      }
      
      // If incoming/outgoing are arrays (daily data)
      if (Array.isArray(incoming) && Array.isArray(outgoing)) {
        // Match arrays by index to create daily data points
        const maxLength = Math.max(incoming.length, outgoing.length);
        return Array.from({ length: maxLength }, (_, i) => {
          const incomingValue = incoming[i] || 0;
          const outgoingValue = outgoing[i] || 0;
          // Generate date labels (assuming week starts from selected date)
          // selectedStartDate is already a Date object
          const date = new Date(selectedStartDate);
          date.setDate(date.getDate() + i);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          return {
            date: `${day}-${month}`,
            dateLabel: `${day}-${month}-${date.getFullYear()}`,
            incoming: incomingValue,
            outgoing: outgoingValue
          };
        });
      }
      
      // If incoming/outgoing are objects with date keys (not null, not arrays)
      if (incoming !== null && outgoing !== null && 
          typeof incoming === 'object' && typeof outgoing === 'object' && 
          !Array.isArray(incoming) && !Array.isArray(outgoing)) {
        // Safely get keys, handling null/undefined
        const incomingKeys = incoming ? Object.keys(incoming) : [];
        const outgoingKeys = outgoing ? Object.keys(outgoing) : [];
        const dates = incomingKeys.length > 0 ? incomingKeys : outgoingKeys;
        
        if (dates.length > 0) {
          return dates.map(dateKey => {
            const date = new Date(dateKey);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return {
              date: `${day}-${month}`,
              dateLabel: `${day}-${month}-${date.getFullYear()}`,
              incoming: incoming?.[dateKey] || 0,
              outgoing: outgoing?.[dateKey] || 0
            };
          });
        }
      }
      
      // If incoming/outgoing are single values (not null, not objects, not arrays)
      if (incoming !== null && outgoing !== null && 
          typeof incoming !== 'object' && typeof outgoing !== 'object') {
        // selectedStartDate is already a Date object
        const date = new Date(selectedStartDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return [{
          date: `${day}-${month}`,
          dateLabel: `${day}-${month}-${date.getFullYear()}`,
          incoming: incoming || 0,
          outgoing: outgoing || 0
        }];
      }
    }
    
    // Fallback: return empty array if no data or data is null
    return [];
  }, [weeklyFundsData, selectedStartDate]);

  // Period options for picker
  const periodOptions = [
    { value: 'daily', label: 'Daily', description: 'Today' },
    { value: 'weekly', label: 'Weekly', description: 'Last 7 days' },
    { value: 'monthly', label: 'Monthly', description: 'Last 30 days' },
    { value: 'yearly', label: 'Yearly', description: 'Last 365 days' }
  ];

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{payload[0].payload.dateLabel}</p>
          <p className="text-sm text-blue-600">Incoming: {payload[0].value} U</p>
          <p className="text-sm text-teal-600">Outgoing: {payload[1].value} U</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Overview"
          description="Manage Merchant Dashboard Information and Others Details"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Helper function to get last updated date from API or fallback to today
  const getLastUpdated = () => {
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
  };

  return (
     <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Dashboard Overview"
          description="Manage Merchant Dashboard Information and Others Details"
        />
        <div className="text-sm text-muted-foreground">
          Last updated: {getLastUpdated()}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Weekly Incoming & Outgoing Funds Chart */}
      <Card title="Weekly Incoming & Outgoing Funds">
        <div className="space-y-4">
          {/* Header with Period Picker */}
          <div className="flex items-center justify-between">
            <div className="flex flex-row items-center gap-3">
              <p>Start From Date:</p>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors"
                >
                  <span className="font-medium">
                    {selectedStartDateFormatted} ({periodOptions.find(p => p.value === selectedPeriod)?.label || 'Weekly'})
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 bg-card border rounded-lg shadow-lg z-10 min-w-[200px]">
                    {periodOptions.map((option) => {
                      const calculatedDate = calculateStartDate(option.value);
                      const formattedDate = formatDateForDisplay(calculatedDate);
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedPeriod(option.value);
                            setShowDatePicker(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            selectedPeriod === option.value 
                              ? 'bg-secondary font-medium hover:bg-secondary' 
                              : 'hover:bg-secondary'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {formattedDate} - {option.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="w-full">
            {loadingWeeklyFunds ? (
              <div className="h-[420px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading weekly funds data...</p>
              </div>
            ) : weeklyChartData && weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={420} minHeight={420}>
                <BarChart data={weeklyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="incoming" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="outgoing" stackId="a" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[420px] flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-2">No weekly funds data available</p>
                {weeklyFundsData && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {(() => {
                      const fundsData = weeklyFundsData.data || weeklyFundsData;
                      const incoming = fundsData.incoming;
                      const outgoing = fundsData.outgoing;
                      return (
                        <>
                          {incoming !== null && incoming !== undefined && (
                            <p>Incoming: {incoming || 0}</p>
                          )}
                          {outgoing !== null && outgoing !== undefined && (
                            <p>Outgoing: {outgoing || 0}</p>
                          )}
                          {(incoming === null || incoming === undefined) && (outgoing === null || outgoing === undefined) && (
                            <p className="text-xs">Data is currently unavailable</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-muted-foreground">Incoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500 rounded"></div>
              <span className="text-muted-foreground">Outgoing</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
