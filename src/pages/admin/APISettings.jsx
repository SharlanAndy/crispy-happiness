import { useState, useMemo, useEffect } from 'react';
import { Copy, RefreshCw, Save, Plus, X } from 'lucide-react';
import { Card, FormField, Button, PageHeader, DataTable, SearchBar } from '../../components/ui';
import { FormLabel, FormSection, TextInput } from '../../components/form';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createKeyForm, setCreateKeyForm] = useState(INITIAL_KEY_DATA);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [createdKeyData, setCreatedKeyData] = useState(null); // Store the full response data
  const [hasNextPageLogs, setHasNextPageLogs] = useState(false);
  const [hasNextPageKeys, setHasNextPageKeys] = useState(false);
  const [paginationMetaLogs, setPaginationMetaLogs] = useState({ limit: 20, page: 1, total: null });
  const [paginationMetaKeys, setPaginationMetaKeys] = useState({ limit: 20, page: 1, total: null });
  const { handleApiResponse, showError, showSuccess } = useToast();

  // Fetch API keys and logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching API keys...');
        const keysParams = { page: apiKeysPage };
        const [keysResult, logsResult] = await Promise.all([
          api.systemadmin.getAPIKeys(keysParams),
          api.systemadmin.getAPILogs({ page: currentPage })
        ]);
        console.log('API Keys result:', keysResult);

        if (keysResult && keysResult.success && keysResult.data) {
          const dataArray = Array.isArray(keysResult.data) ? keysResult.data : [];
          const limit = keysResult.limit || 20;
          const page = keysResult.page || apiKeysPage;
          const total = keysResult.total || null;
          
          setPaginationMetaKeys({ limit, page, total });
          
          // Transform all keys, even if array is empty
          const transformed = dataArray.map(key => ({
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

          // Determine if there's a next page for keys
          if (total !== null) {
            setHasNextPageKeys(page * limit < total);
          } else if (dataArray.length < limit) {
            setHasNextPageKeys(false);
          } else if (dataArray.length === limit && page === 1) {
            const checkNextPage = async () => {
              try {
                const nextPageResult = await api.systemadmin.getAPIKeys({ page: 2 });
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = Array.isArray(nextPageResult.data) ? nextPageResult.data : [];
                  setHasNextPageKeys(nextPageData.length > 0);
                } else {
                  setHasNextPageKeys(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageKeys(false);
              }
            };
            checkNextPage();
          } else if (dataArray.length === limit && page > 1) {
            const checkNextPage = async () => {
              try {
                const nextPageResult = await api.systemadmin.getAPIKeys({ page: page + 1 });
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = Array.isArray(nextPageResult.data) ? nextPageResult.data : [];
                  setHasNextPageKeys(nextPageData.length > 0);
                } else {
                  setHasNextPageKeys(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageKeys(false);
              }
            };
            checkNextPage();
          }
          
          // Find the latest API key (by created_at or id) and set as default
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
            // Set default to latest key on initial load only
            if (isInitialLoad) {
          setKeys({
                apiKey: latestKey.api_key || latestKey.api_key_full || 'prod_****************ab12',
                apiKeyFull: latestKey.api_key_full || latestKey.api_key || '', // Store full key for copying
                keyName: latestKey.key_name || 'N/A',
                merchantKey: latestKey.merchant_key || 'XyZ123!@#456',
                callbackUrl: latestKey.backend_url || 'https://your-website.com/api/callback'
          });
              setSelectedKeyId(latestKey.id);
              setIsInitialLoad(false);
            }
          }
        } else {
          console.warn('API Keys response:', keysResult);
          setApiKeys([]);
        }

        if (logsResult && logsResult.success) {
          const dataArray = logsResult.data || [];
          const limit = logsResult.limit || 20;
          const page = logsResult.page || currentPage;
          const total = logsResult.total || null;
          
          setPaginationMetaLogs({ limit, page, total });
          
          const transformed = dataArray.map(log => ({
            date: log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : '',
            endpoint: log.event_endpoint || '',
            status: `${log.status} ${log.status === '200' ? 'OK' : log.status === '201' ? 'Created' : log.status === '404' ? 'Not Found' : log.status === '500' ? 'Error' : ''}`,
            ip: log.ip_address || ''
          }));
          setLogsData(transformed);

          // Determine if there's a next page for logs
          if (total !== null) {
            setHasNextPageLogs(page * limit < total);
          } else if (dataArray.length < limit) {
            setHasNextPageLogs(false);
          } else if (dataArray.length === limit && page === 1) {
            const checkNextPage = async () => {
              try {
                const nextPageResult = await api.systemadmin.getAPILogs({ page: 2 });
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPageLogs(nextPageData.length > 0);
                } else {
                  setHasNextPageLogs(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageLogs(false);
              }
            };
            checkNextPage();
          } else if (dataArray.length === limit && page > 1) {
            const checkNextPage = async () => {
              try {
                const nextPageResult = await api.systemadmin.getAPILogs({ page: page + 1 });
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPageLogs(nextPageData.length > 0);
                } else {
                  setHasNextPageLogs(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageLogs(false);
              }
            };
            checkNextPage();
          }
        }
      } catch (error) {
        console.error('Failed to fetch API settings:', error);
        console.error('Error details:', error.response || error.message);
        setApiKeys([]);
        setLogsData([]);
        setHasNextPageKeys(false);
        setHasNextPageLogs(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, apiKeysPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate total pages for logs
  const totalPages = useMemo(() => {
    if (paginationMetaLogs.total !== null && paginationMetaLogs.total !== undefined) {
      return Math.ceil(paginationMetaLogs.total / paginationMetaLogs.limit);
    }
    if (logsData.length < paginationMetaLogs.limit) {
      return paginationMetaLogs.page;
    }
    if (logsData.length === paginationMetaLogs.limit) {
      return hasNextPageLogs ? paginationMetaLogs.page + 1 : paginationMetaLogs.page;
    }
    return 1;
  }, [paginationMetaLogs, logsData.length, hasNextPageLogs]);

  // Apply client-side search only (API handles pagination)
  const logs = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return logsData;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return logsData.filter(log => {
      return (
        log.date?.toLowerCase().includes(searchLower) ||
        log.endpoint?.toLowerCase().includes(searchLower) ||
        log.status?.toLowerCase().includes(searchLower) ||
        log.ip?.toLowerCase().includes(searchLower)
      );
    });
  }, [logsData, searchTerm]);

  // Calculate total pages for API keys
  const apiKeysTotalPages = useMemo(() => {
    if (paginationMetaKeys.total !== null && paginationMetaKeys.total !== undefined) {
      return Math.ceil(paginationMetaKeys.total / paginationMetaKeys.limit);
    }
    if (apiKeys.length < paginationMetaKeys.limit) {
      return paginationMetaKeys.page;
    }
    if (apiKeys.length === paginationMetaKeys.limit) {
      return hasNextPageKeys ? paginationMetaKeys.page + 1 : paginationMetaKeys.page;
    }
    return 1;
  }, [paginationMetaKeys, apiKeys.length, hasNextPageKeys]);

  // Apply client-side search only (API handles pagination)
  const filteredApiKeys = useMemo(() => {
    if (!apiKeysSearchTerm || !apiKeysSearchTerm.trim()) {
      return apiKeys;
    }
    const searchLower = apiKeysSearchTerm.toLowerCase().trim();
    return apiKeys.filter(key => {
      return (
        key.key_name?.toLowerCase().includes(searchLower) ||
        key.api_key?.toLowerCase().includes(searchLower) ||
        key.backend_url?.toLowerCase().includes(searchLower) ||
        key.merchant_key?.toLowerCase().includes(searchLower) ||
        key.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [apiKeys, apiKeysSearchTerm]);

  // Handle row click to update Key's Information
  const handleKeyRowClick = (row) => {
    // Find the full key data from apiKeys array
    const fullKeyData = apiKeys.find(k => k.id === row.id);
    if (fullKeyData) {
      setKeys({
        apiKey: fullKeyData.api_key || fullKeyData.api_key_full || 'prod_****************ab12',
        apiKeyFull: fullKeyData.api_key_full || fullKeyData.api_key || '',
        keyName: fullKeyData.key_name || 'N/A',
        merchantKey: fullKeyData.merchant_key || 'XyZ123!@#456',
        callbackUrl: fullKeyData.backend_url || 'https://your-website.com/api/callback'
      });
      setSelectedKeyId(fullKeyData.id);
    }
  };

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
        // Store the newly created key data to display in modal
        setCreatedKeyData(result.data);
        setNewlyCreatedKey(result.data);
        
        // Show success message
        showSuccess('API key created successfully!', 5000);
        
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
        // Don't close modal - keep it open to show response data
        // setShowCreateModal(false);
        // setCreateKeyForm(INITIAL_KEY_DATA);
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

    if (!keys.callbackUrl || keys.callbackUrl.trim() === '') {
      showError('Please enter a backend URL');
      return;
    }

    try {
      const payload = {
        backend_url: keys.callbackUrl.trim(),
        key_id: Number(selectedKeyId) // Ensure key_id is a number
      };
      
      console.log('Updating callback settings with payload:', payload);
      const result = await api.systemadmin.updateCallbackSettings(payload);

      handleApiResponse(result, {
        successMessage: 'Callback settings updated successfully!',
        errorMessage: result?.message || 'Failed to update callback settings. Please try again.',
        onSuccess: () => {
          // Optionally refresh the keys list to show updated backend_url
          // This is optional since the UI already shows the updated value
      }
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
              setHasNextPageKeys(false); // Reset next page check when search changes
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
          onRowClick={handleKeyRowClick}
          selectedRowId={selectedKeyId}
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
              setHasNextPageLogs(false); // Reset next page check when search changes
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-[10px] w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] max-h-[95vh] sm:max-h-[90vh] flex flex-col m-2 sm:m-0">
            <div className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6">
              <h2 className="font-semibold text-lg sm:text-xl md:text-2xl text-black">Create New API Key</h2>
              <button onClick={() => { 
                setShowCreateModal(false); 
                setCreateKeyForm(INITIAL_KEY_DATA);
                setCreatedKeyData(null);
              }} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} className="sm:w-8 sm:h-8 text-[#868e8d]" />
              </button>
            </div>

            {createdKeyData ? (
              // Success view - display response data
              <div className="flex-1 py-3 px-4 sm:py-4 sm:px-6">
                <div className="flex flex-col gap-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-2">
                    <p className="text-green-800 font-semibold text-sm sm:text-base">API key created successfully!</p>
                    <p className="text-green-700 text-xs sm:text-sm mt-1">Please save the secret key - it won't be shown again.</p>
                  </div>
                  
                  <div className="border border-neutral-200 rounded-3xl p-4 sm:p-6 flex flex-col gap-2">
                    <h3 className="font-semibold text-base sm:text-lg text-black mb-1">Created API Key Information</h3>
                    <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-sm sm:text-base text-black">Key Name</p>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-secondary/50 border-none text-xs sm:text-sm">
                        {createdKeyData.key_name || 'N/A'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-sm sm:text-base text-black">API Key</p>
                      <div className="flex gap-1 sm:gap-2">
                        <div className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-secondary/50 border-none text-xs sm:text-sm font-mono break-all">
                          {createdKeyData.api_key || 'N/A'}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(createdKeyData.api_key || '')}
                          className="p-1.5 sm:p-2 hover:bg-accent rounded-md flex-shrink-0"
                        >
                          <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-sm sm:text-base text-black">Secret Key</p>
                      <div className="flex gap-1 sm:gap-2">
                        <div className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-secondary/50 border-none text-xs sm:text-sm font-mono break-all">
                          {createdKeyData.secret_key || 'N/A'}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(createdKeyData.secret_key || '')}
                          className="p-1.5 sm:p-2 hover:bg-accent rounded-md flex-shrink-0"
                        >
                          <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-sm sm:text-base text-black">Backend URL</p>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-secondary/50 border-none text-xs sm:text-sm break-all">
                        {createdKeyData.backend_url || 'N/A'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-sm sm:text-base text-black">Merchant Key</p>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-secondary/50 border-none text-xs sm:text-sm">
                        {createdKeyData.merchant_key || 'N/A'}
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Form view - input fields
              <>
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

                <div className="flex gap-2 sm:gap-4 justify-end py-3 px-4 sm:py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => { 
                      setShowCreateModal(false); 
                      setCreateKeyForm(INITIAL_KEY_DATA);
                      setCreatedKeyData(null);
                    }}
                    className="border border-[#a1abaa] p-2 sm:p-3 rounded-md font-semibold text-sm sm:text-base md:text-lg text-black hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={() => handleCreateNewKey(createKeyForm)}
                    className="bg-black p-2 sm:p-3 rounded-md font-semibold text-sm sm:text-base md:text-lg text-white hover:bg-gray-800 transition-colors flex items-center gap-2 sm:gap-3"
                  >
                    <Plus size={18} className="sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Create Key</span>
                    <span className="sm:hidden">Create</span>
                  </button>
                </div>
              </>
            )}
            
            {createdKeyData && (
              <div className="flex gap-2 sm:gap-4 justify-end py-3 px-4 sm:py-4 sm:px-6 border-t">
                <button
                  type="button"
                  onClick={() => { 
                    setShowCreateModal(false); 
                    setCreateKeyForm(INITIAL_KEY_DATA);
                    setCreatedKeyData(null);
                  }}
                  className="bg-black p-2 sm:p-3 rounded-md font-semibold text-sm sm:text-base md:text-lg text-white hover:bg-gray-800 transition-colors w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
