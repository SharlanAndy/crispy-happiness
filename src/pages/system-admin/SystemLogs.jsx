import { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { DataTable, PageHeader } from '@/components/ui';
import { api } from '@/lib/api';

const LEVEL_COLORS = {
  INFO: 'bg-[#DCFCE7] text-[#166534]',
  WARNING: 'bg-[#FDF9C9] text-[#7D4F1F]',
  ERROR: 'bg-[#F9E3E3] text-[#8B2822]'
};

const FILTERS = [
  { label: 'Date Range', default: 'all', options: ['all', '24h', '7d', '30d'], getLabel: (v) => v === 'all' ? 'All' : v === '24h' ? 'Last 24 Hours' : v === '7d' ? 'Last 7 Days' : 'Last 30 Days' },
  { label: 'Log Level', default: 'all', options: ['all', 'INFO', 'WARNING', 'ERROR'], getLabel: (v) => v === 'all' ? 'All Level' : v },
  { 
    label: 'Status', 
    default: 'all', 
    options: [
      'all', 
      '200 OK', 
      '201 Created', 
      '202 Accepted', 
      '204 No Content', 
      '301 Moved Permanently', 
      '302 Found', 
      '304 Not Modified', 
      '400 Bad Request', 
      '401 Unauthorized', 
      '403 Forbidden', 
      '404 Not Found', 
      '409 Conflict', 
      '422 Unprocessable Entity', 
      '429 Too Many Requests', 
      '500 Internal Server Error', 
      '502 Bad Gateway', 
      '503 Service Unavailable', 
      '504 Gateway Timeout'
    ], 
    getLabel: (v) => v === 'all' ? 'All Status' : v 
  },
];

export default function SystemLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(FILTERS.map(f => f.default));
  const [loading, setLoading] = useState(true);
  const [logsData, setLogsData] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState({ limit: 20, page: 1, total: null });

  // Fetch logs data
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const [dateRange, levelFilter, statusFilter] = filters;
        const params = {
          page: currentPage,
          ...(dateRange !== 'all' && { date_range: dateRange }),
          ...(levelFilter !== 'all' && { level: levelFilter }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
        };
        const result = await api.systemadmin.getLogs(params);
        if (result && result.success) {
          const dataArray = result.data || [];
          const limit = result.limit || 20;
          const page = result.page || currentPage;
          const total = result.total || null;
          
          setPaginationMeta({ limit, page, total });
          
          const transformed = dataArray.map(log => ({
            dateTime: log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : 'N/A',
            level: log.level || 'INFO',
            source: log.source || 'N/A',
            endpoint: log.event_endpoint || 'N/A',
            status: log.status || 'N/A',
            ip: log.ip_address || 'N/A'
          }));
          setLogsData(transformed);

          // Determine if there's a next page
          if (total !== null) {
            setHasNextPage(page * limit < total);
          } else if (dataArray.length < limit) {
            setHasNextPage(false);
          } else if (dataArray.length === limit && page === 1) {
            // Check page 2
            const checkNextPage = async () => {
              try {
                const nextPageParams = {
                  page: 2,
                  ...(dateRange !== 'all' && { date_range: dateRange }),
                  ...(levelFilter !== 'all' && { level: levelFilter }),
                  ...(statusFilter !== 'all' && { status: statusFilter }),
                };
                const nextPageResult = await api.systemadmin.getLogs(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPage(nextPageData.length > 0);
                } else {
                  setHasNextPage(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPage(false);
              }
            };
            checkNextPage();
          } else if (dataArray.length === limit && page > 1) {
            // Check next page
            const checkNextPage = async () => {
              try {
                const nextPageParams = {
                  page: page + 1,
                  ...(dateRange !== 'all' && { date_range: dateRange }),
                  ...(levelFilter !== 'all' && { level: levelFilter }),
                  ...(statusFilter !== 'all' && { status: statusFilter }),
                };
                const nextPageResult = await api.systemadmin.getLogs(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPage(nextPageData.length > 0);
                } else {
                  setHasNextPage(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPage(false);
              }
            };
            checkNextPage();
          }
        } else {
          setLogsData([]);
          setHasNextPage(false);
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        setLogsData([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [currentPage, filters]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate total pages based on API response
  const totalPages = useMemo(() => {
    if (paginationMeta.total !== null && paginationMeta.total !== undefined) {
      return Math.ceil(paginationMeta.total / paginationMeta.limit);
    }
    if (logsData.length < paginationMeta.limit) {
      return paginationMeta.page;
    }
    if (logsData.length === paginationMeta.limit) {
      return hasNextPage ? paginationMeta.page + 1 : paginationMeta.page;
    }
    return 1;
  }, [paginationMeta, logsData.length, hasNextPage]);

  // Use logs data directly from API (no client-side pagination)
  const logs = logsData;

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
    setHasNextPage(false); // Reset next page check when filter changes
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
