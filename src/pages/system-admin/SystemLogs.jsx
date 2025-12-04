import React, { useState, useEffect } from 'react';
import { DataTable, SearchBar, PageHeader } from '../../components/ui';

export default function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const allLogs = [
    { id: '1', level: 'INFO', message: 'User login successful', ip: '192.168.1.1', dateTime: '01-11-2025 13:00', status: '200' },
    { id: '2', level: 'WARNING', message: 'Failed login attempt', ip: '192.168.1.2', dateTime: '01-11-2025 13:05', status: '401' },
    { id: '3', level: 'ERROR', message: 'Database connection timeout', ip: '192.168.1.3', dateTime: '01-11-2025 13:10', status: '500' },
    { id: '4', level: 'INFO', message: 'Merchant created successfully', ip: '192.168.1.1', dateTime: '01-11-2025 13:15', status: '201' },
    { id: '5', level: 'INFO', message: 'Withdrawal approved', ip: '192.168.1.4', dateTime: '01-11-2025 13:20', status: '200' },
  ];

  // Filter logs based on search term, level, and time range
  const logs = allLogs.filter(log => {
    // Search filter
    if (searchTerm !== '') {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = log.message.toLowerCase().includes(searchLower) ||
        log.ip.toLowerCase().includes(searchLower) ||
        log.status.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Level filter
    if (levelFilter !== 'all' && log.level !== levelFilter) {
      return false;
    }

    // Time filter (simplified - in real app would check actual dates)
    // For now, just return true as we don't have real timestamps
    return true;
  });

  const columns = [
    { key: 'id', label: 'Log ID' },
    {
      key: 'level',
      label: 'Level',
      render: (val) => {
        const colors = {
          INFO: 'text-blue-600 bg-blue-100',
          WARNING: 'text-yellow-600 bg-yellow-100',
          ERROR: 'text-red-600 bg-red-100',
        };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[val]}`}>{val}</span>;
      }
    },
    { key: 'message', label: 'Message' },
    { key: 'ip', label: 'IP Address', render: (val) => <span className="font-mono text-xs">{val}</span> },
    { key: 'dateTime', label: 'Date & Time' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Logs"
        description="Monitor system activities and errors"
      />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Activity Logs</h2>
          <div className="flex gap-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-background cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-background cursor-pointer"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-b">
          <SearchBar
            placeholder="Search logs..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-sm"
          />
        </div>

        <DataTable
          columns={columns}
          data={logs}
          pagination={{
            currentPage,
            totalPages: 5,
            onPageChange: setCurrentPage,
          }}
        />
      </div>
    </div>
  );
}
