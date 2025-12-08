import { useState, useMemo, useEffect } from 'react';
import { Copy, RefreshCw, Save } from 'lucide-react';
import { Card, FormField, Button, PageHeader, DataTable, SearchBar } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';
import { t3Service } from '../../services/t3Service';

const ITEMS_PER_PAGE = 10;
const LOG_SEARCH_KEYS = ['date', 'endpoint', 'status', 'ip'];

const EXAMPLE_JSON = {
  status: 200,
  data: {
    transaction_id: "tx_123456",
    amount: 100.00,
    currency: "USDT",
    status: "completed"
  }
};

// Removed ALL_LOGS mock data - using real API data only

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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [logsData, setLogsData] = useState([]);
  const [selectedKeyId, setSelectedKeyId] = useState(null);

  // Fetch API keys and logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [keysResult, logsResult] = await Promise.all([
          t3Service.getAPIKeys(),
          t3Service.getAPILogs({ page: 1 }) // Fetch all logs, paginate client-side
        ]);

        if (keysResult.success && keysResult.data && keysResult.data.length > 0) {
          const firstKey = keysResult.data[0];
          setKeys({
            apiKey: firstKey.api_key || firstKey.api_key_full || 'prod_****************ab12',
            secretKey: firstKey.secret_key || 'XyZ123!@#456',
            merchantKey: firstKey.merchant_key || 'XyZ123!@#456',
            callbackUrl: firstKey.backend_url || 'https://your-website.com/api/callback'
          });
          setApiKeys(keysResult.data);
          setSelectedKeyId(firstKey.id);
        }

        if (logsResult.success) {
          const transformed = logsResult.data.map(log => ({
            date: log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : '',
            endpoint: log.event_endpoint || '',
            status: `${log.status} ${log.status === '200' ? 'OK' : log.status === '201' ? 'Created' : log.status === '404' ? 'Not Found' : log.status === '500' ? 'Error' : ''}`,
            ip: log.ip_address || ''
          }));
          setLogsData(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch API settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Apply client-side search and pagination (local fuzzy search)
  const { data: logs, totalPages } = useMemo(
    () => filterAndPaginate(logsData, searchTerm, LOG_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [logsData, searchTerm, currentPage]
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
  };

  const handleCreateNewKey = async () => {
    const keyName = prompt('Enter a name for this API key:');
    if (!keyName) return;

    try {
      const result = await t3Service.createAPIKey({
        key_name: keyName,
        backend_url: keys.callbackUrl,
        merchant_key: keys.merchantKey
      });

      if (result.success && result.data) {
        // Show the new key (secret_key is only shown once)
        alert(`API Key created!\nAPI Key: ${result.data.api_key}\nSecret Key: ${result.data.secret_key}\n\nPlease save the secret key - it won't be shown again!`);
        
        // Refresh keys list
        const keysResult = await t3Service.getAPIKeys();
        if (keysResult.success && keysResult.data && keysResult.data.length > 0) {
          const latestKey = keysResult.data[keysResult.data.length - 1];
          setKeys({
            apiKey: latestKey.api_key || latestKey.api_key_full || 'prod_****************ab12',
            secretKey: result.data.secret_key, // Show the secret only from creation response
            merchantKey: latestKey.merchant_key || 'XyZ123!@#456',
            callbackUrl: latestKey.backend_url || 'https://your-website.com/api/callback'
          });
          setApiKeys(keysResult.data);
          setSelectedKeyId(latestKey.id);
        }
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!selectedKeyId) {
      alert('No API key selected');
      return;
    }

    try {
      const result = await t3Service.updateCallbackSettings({
        backend_url: keys.callbackUrl,
        key_id: selectedKeyId
      });

      if (result.success) {
        alert('Callback settings updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update callback settings:', error);
      alert('Failed to update callback settings. Please try again.');
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="API Setting & Logs" description="Overview of all merchants-related configurations and activity logs." />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading API settings...</p>
        </div>
      </div>
    );
  }

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
        <div className="mb-4">
          <SearchBar
            placeholder="Search logs by endpoint, status, IP..."
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
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
