import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, Modal, Button, FormField, ConfirmDialog } from '../../components/ui';
import { TextInput, PasswordInput } from '../../components/form';
import { t3Service } from '@/services/t3Service';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

// Removed ALL_ACCOUNTS mock data - using real API data only

const STATS = [
  { label: 'Total Account User', value: '5', lastUpdate: '17-11-2025' },
];

const COLUMNS = [
  { key: 'id', label: 'Admin ID' },
  { key: 'username', label: 'Username' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'created', label: 'Create On' },
  { key: 'status', label: 'Status' },
];

export default function AccountManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, handleApiResponse } = useToast();
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', editingId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [accountsData, setAccountsData] = useState([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState({ limit: 20, page: 1, total: null });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    walletAddress: ''
  });

  const basePath = location.pathname.startsWith('/t3-admin') ? '/t3-admin' : '/system-admin';
  const isT3Admin = location.pathname.startsWith('/t3-admin');

  // Fetch accounts data
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!isT3Admin) {
        // System admin - no mock data, use empty array
        setAccountsData([]);
        setTotalAccounts(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = { page: currentPage };
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        
        const result = await t3Service.getAccounts(params);
        if (result.success) {
          const dataArray = result.data || [];
          const limit = result.limit || 20;
          const page = result.page || currentPage;
          const total = result.total || null;
          
          setPaginationMeta({ limit, page, total });
          
          // Transform API data to match table format
          const transformed = dataArray.map(acc => ({
            id: acc.id.toString(),
            username: acc.username,
            character: acc.character || 'Finance',
            lastLogin: acc.last_login ? new Date(acc.last_login).toLocaleString('en-GB') : 'Never',
            created: acc.created_at ? new Date(acc.created_at).toLocaleString('en-GB') : '',
            status: acc.status || 'Active'
          }));
          setAccountsData(transformed);
          setTotalAccounts(total || transformed.length);

          // Determine if there's a next page
          if (total !== null) {
            setHasNextPage(page * limit < total);
          } else if (dataArray.length < limit) {
            setHasNextPage(false);
          } else if (dataArray.length === limit && page === 1) {
            // Check page 2
            const checkNextPage = async () => {
              try {
                const nextPageParams = { page: 2 };
                if (searchTerm && searchTerm.trim()) {
                  nextPageParams.search = searchTerm.trim();
                }
                const nextPageResult = await t3Service.getAccounts(nextPageParams);
                if (nextPageResult.success) {
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
                const nextPageParams = { page: page + 1 };
                if (searchTerm && searchTerm.trim()) {
                  nextPageParams.search = searchTerm.trim();
                }
                const nextPageResult = await t3Service.getAccounts(nextPageParams);
                if (nextPageResult.success) {
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
          setAccountsData([]);
          setTotalAccounts(0);
          setHasNextPage(false);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        setAccountsData([]);
        setTotalAccounts(0);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [currentPage, searchTerm, isT3Admin]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate total pages based on API response
  const totalPages = useMemo(() => {
    if (paginationMeta.total !== null && paginationMeta.total !== undefined) {
      return Math.ceil(paginationMeta.total / paginationMeta.limit);
    }
    if (accountsData.length < paginationMeta.limit) {
      return paginationMeta.page;
    }
    if (accountsData.length === paginationMeta.limit) {
      return hasNextPage ? paginationMeta.page + 1 : paginationMeta.page;
    }
    return 1;
  }, [paginationMeta, accountsData.length, hasNextPage]);

  // Apply client-side search only (API handles pagination)
  const accounts = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return accountsData;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return accountsData.filter(acc => {
      return (
        acc.id?.toLowerCase().includes(searchLower) ||
        acc.username?.toLowerCase().includes(searchLower) ||
        acc.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [accountsData, searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setHasNextPage(false); // Reset next page check when search changes
  };

  const handleOpenCreate = () => {
    setFormData({ username: '', password: '', email: '', walletAddress: '' });
    setModalState({ isOpen: true, mode: 'create', editingId: null });
  };

  const handleOpenEdit = (account) => {
    setFormData({
      username: account.username,
      password: '',
      email: account.email || '',
      walletAddress: account.walletAddress || ''
    });
    setModalState({ isOpen: true, mode: 'edit', editingId: account.id });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'create', editingId: null });
    setFormData({ username: '', password: '', email: '', walletAddress: '' });
  };

  const handleSubmit = async () => {
    if (modalState.mode === 'create') {
        try {
        // Use the correct API endpoint with the required payload structure
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            wallet_address: formData.walletAddress
        };
        
        console.log('Creating account with payload:', payload);
        const result = await api.t3admin.createAccount(payload);
        
        handleApiResponse(result, {
          successMessage: 'Account created successfully!',
          errorMessage: result?.message || 'Failed to create account. Please try again.',
          onSuccess: async () => {
            // Refresh accounts list
            if (isT3Admin) {
            const fetchResult = await t3Service.getAccounts({ page: currentPage, search: searchTerm });
            if (fetchResult.success) {
              const transformed = fetchResult.data.map(acc => ({
                id: acc.id.toString(),
                username: acc.username,
                character: acc.character || 'Finance',
                lastLogin: acc.last_login ? new Date(acc.last_login).toLocaleString('en-GB') : 'Never',
                created: acc.created_at ? new Date(acc.created_at).toLocaleString('en-GB') : '',
                status: acc.status || 'Active'
              }));
              setAccountsData(transformed);
            }
          }
          }
        });
        
        if (!result || !result.success) {
          return;
        }
      } catch (error) {
        console.error('Failed to create account:', error);
        showError('Failed to create account. Please try again.');
        return;
      }
    } else {
      console.log('Updating finance account:', modalState.editingId, formData);
      // TODO: Implement update API when available
    }
    handleCloseModal();
  };

  const handleDelete = (account) => {
    console.log('Deleting account:', account.id);
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const actions = useMemo(() => {
    const baseActions = [
      {
        icon: <Eye size={16} />,
        onClick: (row) => navigate(`${basePath}/accounts/${row.id}`),
        tooltip: 'View Details',
      },
      { 
        icon: <Settings size={16} />, 
        onClick: (row) => handleOpenEdit(row), 
        tooltip: 'Edit Account' 
      },
    ];

    // T3 admin should NOT see delete button on admin list
    if (isT3Admin) return baseActions;

    return [
      ...baseActions,
      {
        icon: <Trash2 size={16} />,
        onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
        variant: 'danger',
        tooltip: 'Delete Account',
      },
    ];
  }, [navigate, basePath, isT3Admin]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Admin Management"
          description="Manage, creating and assigning finance accounts."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Account User" 
            value={totalAccounts.toString()} 
            lastUpdate={new Date().toLocaleDateString('en-GB')} 
          />
        </div>

        {/* New Finance Button */}
        <div className="flex">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Create New Finance
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Admin List</h2>
              <SearchBar
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading accounts...</p>
                </div>
              ) : (
                <DataTable
                  columns={COLUMNS}
                  data={accounts}
                  actions={actions}
                  pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage,
                  }}
                />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Create/Edit Finance Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        title={modalState.mode === 'create' ? 'New Finance' : 'Edit Finance'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {modalState.mode === 'create' ? 'Create Account' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Username">
            <TextInput
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Insert username"
              readOnly={modalState.mode === 'edit'}
            />
          </FormField>

          <FormField label="Password">
            <PasswordInput
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={modalState.mode === 'edit' ? 'Leave blank to keep current password' : 'Insert password'}
            />
          </FormField>

          {/* Edit Finance: keep only password field (hide email + wallet address) */}
          {modalState.mode !== 'edit' && (
            <>
              <FormField label="Email">
                <TextInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Insert email"
                />
              </FormField>

              <FormField label="Wallet Address">
                <TextInput
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="Insert wallet address"
                />
              </FormField>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteConfirm.item)}
        title="Delete Account"
        message={`Are you sure you want to delete account "${deleteConfirm.item?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
