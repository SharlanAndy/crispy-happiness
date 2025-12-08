import { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { DataTable, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';

const ITEMS_PER_PAGE = 10;

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
  const [loading, setLoading] = useState(true);
  const [logsData, setLogsData] = useState([]);

  // Fetch logs data
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const [dateRange, levelFilter, statusFilter] = filters;
        const params = {
          page: currentPage,
          ...(dateRange !== '24h' && { date_range: dateRange }),
          ...(levelFilter !== 'all' && { level: levelFilter }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
        };
        const result = await api.systemadmin.getLogs(params);
        if (result && result.success) {
          const transformed = result.data.map(log => ({
            dateTime: log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : 'N/A',
            level: log.level || 'INFO',
            source: log.source || 'N/A',
            endpoint: log.event_endpoint || 'N/A',
            status: log.status || 'N/A',
            ip: log.ip_address || 'N/A'
          }));
          setLogsData(transformed);
        } else {
          setLogsData([]);
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        setLogsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [currentPage, filters]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const { logs, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return { 
      logs: logsData.slice(start, start + ITEMS_PER_PAGE), 
      totalPages: Math.ceil(logsData.length / ITEMS_PER_PAGE) 
    };
  }, [logsData, currentPage]);

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
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No logs found</p>
            </div>
          ) : (
            <DataTable columns={columns} data={logs} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
          )}
        </div>
      </div>
    </div>
  );
}
