import { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, PageHeader, StatCard } from '../../components/ui';

export default function T3AdminDashboard() {
  const [currentPage] = useState(1);
  const [selectedStartDate, setSelectedStartDate] = useState('14 Nov 2025');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  const stats = [
    { label: 'Total Incoming Funds', value: '6,000.00 USDT', lastUpdate: '17-11-2025', },
    { label: 'Total Outgoing Funds', value: '4,000.00 USDT', lastUpdate: '17-11-2025', type: 'outgoing' },
    { label: 'Monthly Incoming Funds', value: '4,000.00 USDT', lastUpdate: '17-11-2025', type: 'outgoing' },
    { label: 'Monthly Outgoing Funds', value: '4,000.00 USDT', lastUpdate: '17-11-2025', type: 'outgoing' },
  ];

  // All weekly chart data - full dataset
  const allWeeklyData = {
    '14 Nov 2025': [
      { date: '14-11', dateLabel: '14-11-2025', incoming: 160, outgoing: 60 },
      { date: '15-11', dateLabel: '15-11-2025', incoming: 180, outgoing: 80 },
      { date: '16-11', dateLabel: '16-11-2025', incoming: 140, outgoing: 70 },
      { date: '17-11', dateLabel: '17-11-2025', incoming: 160, outgoing: 60 },
      { date: '18-11', dateLabel: '18-11-2025', incoming: 200, outgoing: 100 },
      { date: '19-11', dateLabel: '19-11-2025', incoming: 150, outgoing: 50 },
      { date: '20-11', dateLabel: '20-11-2025', incoming: 180, outgoing: 90 },
    ],
    '7 Nov 2025': [
      { date: '07-11', dateLabel: '07-11-2025', incoming: 120, outgoing: 40 },
      { date: '08-11', dateLabel: '08-11-2025', incoming: 150, outgoing: 60 },
      { date: '09-11', dateLabel: '09-11-2025', incoming: 170, outgoing: 70 },
      { date: '10-11', dateLabel: '10-11-2025', incoming: 140, outgoing: 50 },
      { date: '11-11', dateLabel: '11-11-2025', incoming: 190, outgoing: 80 },
      { date: '12-11', dateLabel: '12-11-2025', incoming: 160, outgoing: 65 },
      { date: '13-11', dateLabel: '13-11-2025', incoming: 175, outgoing: 75 },
    ],
    '31 Oct 2025': [
      { date: '31-10', dateLabel: '31-10-2025', incoming: 130, outgoing: 45 },
      { date: '01-11', dateLabel: '01-11-2025', incoming: 145, outgoing: 55 },
      { date: '02-11', dateLabel: '02-11-2025', incoming: 155, outgoing: 65 },
      { date: '03-11', dateLabel: '03-11-2025', incoming: 165, outgoing: 70 },
      { date: '04-11', dateLabel: '04-11-2025', incoming: 180, outgoing: 85 },
      { date: '05-11', dateLabel: '05-11-2025', incoming: 150, outgoing: 60 },
      { date: '06-11', dateLabel: '06-11-2025', incoming: 170, outgoing: 80 },
    ],
    '24 Oct 2025': [
      { date: '24-10', dateLabel: '24-10-2025', incoming: 110, outgoing: 35 },
      { date: '25-10', dateLabel: '25-10-2025', incoming: 135, outgoing: 50 },
      { date: '26-10', dateLabel: '26-10-2025', incoming: 145, outgoing: 60 },
      { date: '27-10', dateLabel: '27-10-2025', incoming: 155, outgoing: 65 },
      { date: '28-10', dateLabel: '28-10-2025', incoming: 170, outgoing: 75 },
      { date: '29-10', dateLabel: '29-10-2025', incoming: 140, outgoing: 55 },
      { date: '30-10', dateLabel: '30-10-2025', incoming: 160, outgoing: 70 },
    ],
  };

  const dateOptions = Object.keys(allWeeklyData);

  // Get chart data based on selected date
  const weeklyChartData = useMemo(
    () => allWeeklyData[selectedStartDate] || allWeeklyData['14 Nov 2025'],
    [selectedStartDate]
  );

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

  return (
     <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Manage Merchant Dashboard Information and Others Details"
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Weekly Incoming & Outgoing Funds Chart */}
      <Card title="Weekly Incoming & Outgoing Funds">
        <div className="space-y-4">
          {/* Header with Date Picker */}
          <div className="flex items-center justify-between">
            <div className="flex flex-row items-center gap-3">
              <p>Start From Date:</p>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors"
                >
                  <span className="font-medium">{selectedStartDate}</span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 bg-card border rounded-lg shadow-lg z-10 min-w-[150px]">
                    {dateOptions.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedStartDate(date);
                          setShowDatePicker(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          selectedStartDate === date 
                            ? 'bg-secondary font-medium hover:bg-secondary' 
                            : 'hover:bg-secondary'
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="w-full">
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
                  domain={[0, 420]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="incoming" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="outgoing" stackId="a" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
