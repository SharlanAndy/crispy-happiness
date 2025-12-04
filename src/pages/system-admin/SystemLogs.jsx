import { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { DataTable, PageHeader } from '../../components/ui';

const ITEMS_PER_PAGE = 10;

const ALL_LOGS = [
  { dateTime: '01-11-2025 13:00', level: 'INFO', source: 'Auth Service', endpoint: '/api/login', status: '200', ip: '192.168.1.1' },
  { dateTime: '01-11-2025 13:05', level: 'WARNING', source: 'Auth Service', endpoint: '/api/login', status: '401', ip: '192.168.1.2' },
  { dateTime: '01-11-2025 13:10', level: 'ERROR', source: 'Database', endpoint: '/api/query', status: '500', ip: '192.168.1.3' },
  { dateTime: '01-11-2025 13:15', level: 'INFO', source: 'Merchant Service', endpoint: '/api/merchant/create', status: '201', ip: '192.168.1.1' },
  { dateTime: '01-11-2025 13:20', level: 'INFO', source: 'Withdrawal Service', endpoint: '/api/withdrawal/approve', status: '200', ip: '192.168.1.4' },
  { dateTime: '01-11-2025 13:25', level: 'ERROR', source: 'Payment Gateway', endpoint: '/api/payment/process', status: '500', ip: '192.168.1.5' },
  { dateTime: '01-11-2025 13:30', level: 'INFO', source: 'Agent Service', endpoint: '/api/agent/register', status: '201', ip: '192.168.1.6' },
  { dateTime: '01-11-2025 13:35', level: 'WARNING', source: 'API Gateway', endpoint: '/api/rate-limit', status: '429', ip: '192.168.1.7' },
  { dateTime: '01-11-2025 13:40', level: 'INFO', source: 'Transaction Service', endpoint: '/api/transaction/complete', status: '200', ip: '192.168.1.8' },
  { dateTime: '01-11-2025 13:45', level: 'ERROR', source: 'External API', endpoint: '/api/external/call', status: '504', ip: '192.168.1.9' },
  { dateTime: '01-11-2025 13:50', level: 'INFO', source: 'Auth Service', endpoint: '/api/logout', status: '200', ip: '192.168.1.1' },
  { dateTime: '01-11-2025 13:55', level: 'WARNING', source: 'Auth Service', endpoint: '/api/validate', status: '403', ip: '192.168.1.10' },
];

const LEVEL_COLORS = {
  INFO: 'bg-[#DCFCE7] text-[#166534]',
  WARNING: 'bg-[#FDF9C9] text-[#7D4F1F]',
  ERROR: 'bg-[#F9E3E3] text-[#8B2822]'
};

const FILTERS = [
  { label: 'Date Range', default: '24h', options: ['24h', '7d', '30d'], labels: ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'] },
  { label: 'Log Level', default: 'all', options: ['all', 'INFO', 'WARNING', 'ERROR'], getLabel: (v) => v === 'all' ? 'All Level' : v },
  { label: 'Status', default: 'all', options: ['all', '200', '201', '401', '403', '429', '500', '504'], getLabel: (v) => v === 'all' ? 'All Status' : v },
];

export default function SystemLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(FILTERS.map(f => f.default));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const { logs, totalPages } = useMemo(() => {
    const [, levelFilter, statusFilter] = filters;
    const filtered = ALL_LOGS.filter(log => 
      (levelFilter === 'all' || log.level === levelFilter) &&
      (statusFilter === 'all' || log.status === statusFilter)
    );
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return { 
      logs: filtered.slice(start, start + ITEMS_PER_PAGE), 
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE) 
    };
  }, [filters, currentPage]);

  const columns = [
    { key: 'dateTime', label: 'Time' },
    { key: 'level', label: 'Level', render: (v) => <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${LEVEL_COLORS[v]}`}>{v}</span> },
    { key: 'source', label: 'Source' },
    { key: 'endpoint', label: 'Event/End Point' },
    { key: 'status', label: 'Status Code', render: (v) => v },
    { key: 'ip', label: 'IP Address' },
  ];

  const handleFilterChange = (idx, value) => {
    setFilters(prev => prev.map((v, i) => i === idx ? value : v));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="System Logs" description="Monitor system activities and errors" />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold">Activity Logs</h2>
          <div className="flex flex-row gap-6">
            {FILTERS.map((filter, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="text-sm">{filter.label}:</div>
                <div className="relative">
                  <select
                    value={filters[idx]}
                    onChange={(e) => handleFilterChange(idx, e.target.value)}
                    className="bg-[#f3f3f5] rounded-md p-3 text-sm pr-10 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {filter.options.map((opt, i) => (
                      <option key={opt} value={opt}>
                        {filter.labels?.[i] || filter.getLabel?.(opt) || opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
              </div>
            ))}
          </div>
          <DataTable columns={columns} data={logs} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
        </div>
      </div>
    </div>
  );
}
