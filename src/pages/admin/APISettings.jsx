import { useState, useMemo, useEffect } from 'react';
import { Copy, RefreshCw, Save } from 'lucide-react';
import { Card, FormField, Button, PageHeader, DataTable } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';

const ITEMS_PER_PAGE = 10;
const LOG_SEARCH_KEYS = ['endpoint', 'status', 'ip'];

const EXAMPLE_JSON = {
  status: 200,
  data: {
    transaction_id: "tx_123456",
    amount: 100.00,
    currency: "USDT",
    status: "completed"
  }
};

const ALL_LOGS = [
  { date: '01-11-2025 13:00', endpoint: 'POST /api/v1/transactions', status: '200 OK', ip: '192.168.1.1' },
  { date: '01-11-2025 13:05', endpoint: 'POST /api/v1/users', status: '201 Created', ip: '192.168.1.2' },
  { date: '01-11-2025 13:10', endpoint: 'GET /api/v1/orders', status: '404 Not Found', ip: '192.168.1.3' },
  { date: '01-11-2025 13:15', endpoint: 'GET /api/v1/transactions', status: '200 OK', ip: '192.168.1.1' },
  { date: '01-11-2025 13:20', endpoint: 'PUT /api/v1/users/123', status: '200 OK', ip: '192.168.1.4' },
  { date: '01-11-2025 13:25', endpoint: 'DELETE /api/v1/orders/456', status: '500 Error', ip: '192.168.1.5' },
];

const LOG_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'endpoint', label: 'Endpoint' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => {
      const isSuccess = value.startsWith('2');
      const isClientError = value.startsWith('4');
      const isServerError = value.startsWith('5');
      
      let colorClass = 'bg-gray-100 text-gray-700';
      if (isSuccess) colorClass = 'bg-green-100 text-green-700';
      else if (isClientError) colorClass = 'bg-yellow-100 text-yellow-700';
      else if (isServerError) colorClass = 'bg-red-100 text-red-700';
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {value}
        </span>
      );
    }
  },
  { key: 'ip', label: 'IP Address' },
];

export default function APISettings() {
  const [keys, setKeys] = useState({
    apiKey: 'prod_****************ab12',
    secretKey: 'XyZ123!@#456',
    merchantKey: 'XyZ123!@#456',
    callbackUrl: 'https://your-website.com/api/callback'
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Paginate logs
  const { data: logs, totalPages } = useMemo(
    () => filterAndPaginate(ALL_LOGS, '', LOG_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [currentPage]
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
  };

  const handleCreateNewKey = () => {
    const newKeys = {
      ...keys,
      apiKey: 'prod_' + Math.random().toString(36).substr(2, 16),
      secretKey: Math.random().toString(36).substr(2, 12),
      merchantKey: Math.random().toString(36).substr(2, 12),
    };
    setKeys(newKeys);
  };

  const handleSave = () => {
    console.log('Saving API settings...', keys);
  };

  const KeyInput = ({ label, value, onCopy }) => (
    <FormField label={label}>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={value} 
          readOnly 
          className="flex-1 px-3 py-2 rounded-md bg-secondary/50 border-none text-sm" 
        />
        <button 
          onClick={onCopy} 
          className="p-2 hover:bg-accent rounded-md"
        >
          <Copy size={18} />
        </button>
      </div>
    </FormField>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="API Setting & Logs" description="Overview of all merchants-related configurations and activity logs." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Key's Information">
          <div className="space-y-4">
            <KeyInput 
              label="API Key" 
              value={keys.apiKey} 
              onCopy={() => copyToClipboard(keys.apiKey)} 
            />

            <FormField label="Backed URL">
              <input
                type="text"
                value={keys.callbackUrl}
                onChange={(e) => setKeys({ ...keys, callbackUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <KeyInput 
                label="Secret Key" 
                value={keys.secretKey} 
                onCopy={() => copyToClipboard(keys.secretKey)} 
              />
              <KeyInput 
                label="Merchant Key" 
                value={keys.merchantKey} 
                onCopy={() => copyToClipboard(keys.merchantKey)} 
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleCreateNewKey} variant="secondary" icon={<RefreshCw size={18} />} className="flex-1">
                Create New Key
              </Button>
              <Button onClick={handleSave} icon={<Save size={18} />} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Example JSON Response">
          <pre className="bg-secondary/50 p-4 rounded-lg text-xs font-mono overflow-x-auto">
            {JSON.stringify(EXAMPLE_JSON, null, 2)}
          </pre>
          <button
            onClick={() => copyToClipboard(JSON.stringify(EXAMPLE_JSON, null, 2))}
            className="mt-4 text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Copy size={14} /> Copy JSON
          </button>
        </Card>
      </div>

      <Card title="API Logs">
        <DataTable
          columns={LOG_COLUMNS}
          data={logs}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
          }}
        />
      </Card>
    </div>
  );
}
