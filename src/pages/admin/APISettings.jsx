import { useState, useMemo, useEffect } from 'react';
import { Copy, RefreshCw, Save, Plus, X } from 'lucide-react';
import { Card, FormField, Button, PageHeader, DataTable, SearchBar } from '../../components/ui';
import { FormLabel, FormSection, TextInput } from '../../components/form';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const ITEMS_PER_PAGE = 10;
const LOG_SEARCH_KEYS = ['date', 'endpoint', 'status', 'ip'];
const API_KEY_SEARCH_KEYS = ['key_name', 'api_key', 'backend_url', 'merchant_key', 'status'];

const API_KEY_COLUMNS = [
  { key: 'key_name', label: 'Key Name' },
  { 
    key: 'api_key', 
    label: 'API Key',
    render: (value) => {
      if (!value) return 'N/A';
      // Show truncated version if it's long
      if (value.length > 20) {
        return `${value.substring(0, 10)}...${value.substring(value.length - 10)}`;
      }
      return value;
    }
  },
  { key: 'backend_url', label: 'Backend URL' },
  { key: 'merchant_key', label: 'Merchant Key' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => {
      const isActive = value === 'active';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A'}
        </span>
      );
    }
  },
  { 
    key: 'created_at', 
    label: 'Created At',
    render: (value) => value ? new Date(value).toLocaleString('en-GB') : 'N/A'
  },
];

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

const INITIAL_KEY_DATA = {
  key_name: '',
  backend_url: '',
  merchant_key: ''
};

export default function APISettings() {
  const [keys, setKeys] = useState({
    apiKey: 'prod_****************ab12',
    apiKeyFull: '', // Store full API key for copying
    keyName: 'N/A',
    merchantKey: 'XyZ123!@#456',
    callbackUrl: 'https://your-website.com/api/callback'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [apiKeysPage, setApiKeysPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiKeysSearchTerm, setApiKeysSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [logsData, setLogsData] = useState([]);
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createKeyForm, setCreateKeyForm] = useState(INITIAL_KEY_DATA);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const { handleApiResponse, showError, showSuccess } = useToast();

  // Fetch API keys and logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching API keys...');
        const [keysResult, logsResult] = await Promise.all([
          api.systemadmin.getAPIKeys(),
          api.systemadmin.getAPILogs({ page: 1 }) // Fetch all logs, paginate client-side
        ]);
        console.log('API Keys result:', keysResult);

        if (keysResult && keysResult.success && keysResult.data) {
          // Transform all keys, even if array is empty
          const transformed = Array.isArray(keysResult.data) 
            ? keysResult.data.map(key => ({
                id: key.id,
                key_name: key.key_name || 'N/A',
                api_key: key.api_key || key.api_key_full || 'N/A',
                api_key_full: key.api_key_full || key.api_key || 'N/A',
                backend_url: key.backend_url || 'N/A',
                merchant_key: key.merchant_key || 'N/A',
                status: key.status || 'active',
                created_at: key.created_at || '',
                updated_at: key.updated_at || ''
              }))
            : [];
          setApiKeys(transformed);
          
          // Find the latest API key (by created_at or id)
          if (transformed.length > 0 && keysResult.data.length > 0) {
            // Sort by created_at descending, or by id descending if created_at is not available
            const sortedKeys = [...keysResult.data].sort((a, b) => {
              if (a.created_at && b.created_at) {
                return new Date(b.created_at) - new Date(a.created_at);
              }
              // Fallback to ID if created_at is not available
              return (b.id || 0) - (a.id || 0);
            });
            
            const latestKey = sortedKeys[0];
            setKeys({
              apiKey: latestKey.api_key || latestKey.api_key_full || 'prod_****************ab12',
              apiKeyFull: latestKey.api_key_full || latestKey.api_key || '', // Store full key for copying
              keyName: latestKey.key_name || 'N/A',
              merchantKey: latestKey.merchant_key || 'XyZ123!@#456',
              callbackUrl: latestKey.backend_url || 'https://your-website.com/api/callback'
            });
            setSelectedKeyId(latestKey.id);
          }
        } else {
          console.warn('API Keys response:', keysResult);
          setApiKeys([]);
        }

        if (logsResult && logsResult.success) {
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
        console.error('Error details:', error.response || error.message);
        setApiKeys([]);
        setLogsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Apply client-side search and pagination (local fuzzy search)
  const { data: logs, totalPages } = useMemo(
    () => filterAndPaginate(logsData, searchTerm, LOG_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [logsData, searchTerm, currentPage]
  );

  const { data: filteredApiKeys, totalPages: apiKeysTotalPages } = useMemo(
    () => filterAndPaginate(apiKeys, apiKeysSearchTerm, API_KEY_SEARCH_KEYS, apiKeysPage, ITEMS_PER_PAGE),
    [apiKeys, apiKeysSearchTerm, apiKeysPage]
  );

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showError('Failed to copy to clipboard');
    }
  };

  const handleCreateNewKey = async (formData) => {
    try {
      const result = await api.systemadmin.createAPIKey({
        key_name: formData.key_name,
        backend_url: formData.backend_url,
        merchant_key: formData.merchant_key
      });

      handleApiResponse(result, {
        successMessage: 'API key created successfully!',
        errorMessage: result?.message || 'Failed to create API key. Please try again.',
      });

      if (result && result.success && result.data) {
        // Store the newly created key to show secret_key (only shown once)
        setNewlyCreatedKey(result.data);
        
        // Show success message with key details
        showSuccess(`API Key created! API Key: ${result.data.api_key}. Secret Key: ${result.data.secret_key}. Please save the secret key - it won't be shown again!`, 10000);
        
          // Refresh keys list
          const keysResult = await api.systemadmin.getAPIKeys();
          if (keysResult && keysResult.success && keysResult.data) {
            const transformed = keysResult.data.map(key => ({
              id: key.id,
              key_name: key.key_name || 'N/A',
              api_key: key.api_key || key.api_key_full || 'N/A',
              api_key_full: key.api_key_full || key.api_key || 'N/A',
              backend_url: key.backend_url || 'N/A',
              merchant_key: key.merchant_key || 'N/A',
              status: key.status || 'active',
              created_at: key.created_at || '',
              updated_at: key.updated_at || ''
            }));
            setApiKeys(transformed);
            
            // Select the newly created key (which should be the latest)
            if (result.data.id) {
              setSelectedKeyId(result.data.id);
              const newKey = keysResult.data.find(k => k.id === result.data.id);
              if (newKey) {
                setKeys({
                  apiKey: newKey.api_key || newKey.api_key_full || 'prod_****************ab12',
                  apiKeyFull: newKey.api_key_full || newKey.api_key || '',
                  keyName: newKey.key_name || 'N/A',
                  merchantKey: newKey.merchant_key || 'XyZ123!@#456',
                  callbackUrl: newKey.backend_url || 'https://your-website.com/api/callback'
                });
              } else {
                // If new key not found, select the latest key from the list
                const sortedKeys = [...keysResult.data].sort((a, b) => {
                  if (a.created_at && b.created_at) {
                    return new Date(b.created_at) - new Date(a.created_at);
                  }
                  return (b.id || 0) - (a.id || 0);
                });
                if (sortedKeys.length > 0) {
                  const latestKey = sortedKeys[0];
                  setKeys({
                    apiKey: latestKey.api_key || latestKey.api_key_full || 'prod_****************ab12',
                    apiKeyFull: latestKey.api_key_full || latestKey.api_key || '',
                    keyName: latestKey.key_name || 'N/A',
                    merchantKey: latestKey.merchant_key || 'XyZ123!@#456',
                    callbackUrl: latestKey.backend_url || 'https://your-website.com/api/callback'
                  });
                  setSelectedKeyId(latestKey.id);
                }
              }
            }
          }
        setShowCreateModal(false);
        setCreateKeyForm(INITIAL_KEY_DATA);
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      showError(error?.message || 'Failed to create API key. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!selectedKeyId) {
      showError('No API key selected');
      return;
    }

    try {
      const result = await api.systemadmin.updateCallbackSettings({
        backend_url: keys.callbackUrl,
        key_id: selectedKeyId
      });

      handleApiResponse(result, {
        successMessage: 'Callback settings updated successfully!',
        errorMessage: result?.message || 'Failed to update callback settings. Please try again.',
      });
    } catch (error) {
      console.error('Failed to update callback settings:', error);
      showError(error?.message || 'Failed to update callback settings. Please try again.');
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
              onCopy={() => copyToClipboard(keys.apiKeyFull || keys.apiKey)} 
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
                label="Key Name" 
                value={keys.keyName} 
                onCopy={() => copyToClipboard(keys.keyName)} 
              />
              <KeyInput 
                label="Merchant Key" 
                value={keys.merchantKey} 
                onCopy={() => copyToClipboard(keys.merchantKey)} 
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setShowCreateModal(true)} variant="secondary" icon={<Plus size={18} />} className="flex-1">
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

      <Card title="API Keys List">
        <div className="mb-4">
          <SearchBar
            placeholder="Search API keys by name, key, URL..."
            value={apiKeysSearchTerm}
            onChange={(value) => {
              setApiKeysSearchTerm(value);
              setApiKeysPage(1);
            }}
            className="max-w-sm"
          />
        </div>
        <DataTable
          columns={API_KEY_COLUMNS}
          data={filteredApiKeys}
          pagination={{
            currentPage: apiKeysPage,
            totalPages: apiKeysTotalPages,
            onPageChange: setApiKeysPage,
          }}
        />
      </Card>

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

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[10px] w-full max-w-[600px] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between py-4 px-6">
              <h2 className="font-semibold text-2xl text-black">Create New API Key</h2>
              <button onClick={() => { setShowCreateModal(false); setCreateKeyForm(INITIAL_KEY_DATA); }} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={32} className="text-[#868e8d]" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateNewKey(createKeyForm); }} className="flex-1 overflow-y-auto py-4 px-6">
              <div className="flex flex-col gap-6">
                <FormSection title="API Key Information">
                  <FormLabel label="Key Name">
                    <TextInput
                      value={createKeyForm.key_name}
                      onChange={(e) => setCreateKeyForm({ ...createKeyForm, key_name: e.target.value })}
                      placeholder="Enter key name"
                      required
                    />
                  </FormLabel>
                  <FormLabel label="Backend URL">
                    <TextInput
                      value={createKeyForm.backend_url}
                      onChange={(e) => setCreateKeyForm({ ...createKeyForm, backend_url: e.target.value })}
                      placeholder="Enter backend URL"
                      required
                    />
                  </FormLabel>
                  <FormLabel label="Merchant Key">
                    <TextInput
                      value={createKeyForm.merchant_key}
                      onChange={(e) => setCreateKeyForm({ ...createKeyForm, merchant_key: e.target.value })}
                      placeholder="Enter merchant key"
                      required
                    />
                  </FormLabel>
                </FormSection>
              </div>
            </form>

            <div className="flex gap-4 justify-end py-4 px-6">
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); setCreateKeyForm(INITIAL_KEY_DATA); }}
                className="border border-[#a1abaa] p-3 rounded-md font-semibold text-lg text-black hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={() => handleCreateNewKey(createKeyForm)}
                className="bg-black p-3 rounded-md font-semibold text-lg text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <Plus size={24} />
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
