import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, Modal, Button, FormField, ConfirmDialog } from '../../components/ui';
import { TextInput, PasswordInput } from '../../components/form';
import { t3Service } from '@/services/t3Service';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/authService';

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
  // Check actual admin_type from auth service
  const adminType = authService.getAdminType();
  const isT3AdminType = adminType?.toLowerCase() === 't3';

  // Reusable function to fetch accounts
  const fetchAccounts = useCallback(async (pageOverride, searchOverride) => {
    if (!isT3Admin) {
      // System admin - no mock data, use empty array
      setAccountsData([]);
      setTotalAccounts(0);
      setLoading(false);
      return;
    }

    const pageToUse = pageOverride !== undefined ? pageOverride : currentPage;
    const searchToUse = searchOverride !== undefined ? searchOverride : searchTerm;

    try {
      setLoading(true);
      const params = { page: pageToUse };
      if (searchToUse && searchToUse.trim()) {
        params.search = searchToUse.trim();
      }
      
      const result = await t3Service.getAccounts(params);
      if (result.success) {
        const dataArray = result.data || [];
        const limit = result.limit || 20;
        const resultPage = result.page || pageToUse;
        const total = result.total || null;
        
        setPaginationMeta({ limit, page: resultPage, total });
        
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
          setHasNextPage(resultPage * limit < total);
        } else if (dataArray.length < limit) {
          setHasNextPage(false);
        } else if (dataArray.length === limit && resultPage === 1) {
          // Check page 2
          const checkNextPage = async () => {
            try {
              const nextPageParams = { page: 2 };
              if (searchToUse && searchToUse.trim()) {
                nextPageParams.search = searchToUse.trim();
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
        } else if (dataArray.length === limit && resultPage > 1) {
          // Check next page
          const checkNextPage = async () => {
            try {
              const nextPageParams = { page: resultPage + 1 };
              if (searchToUse && searchToUse.trim()) {
                nextPageParams.search = searchToUse.trim();
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
  }, [isT3Admin, currentPage, searchTerm]);

  // Fetch accounts data
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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
      email: '',
      walletAddress: ''
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
        // For T3 Admin (admin_type=t3), wallet_address is not required
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password
        };
        
        // Only include wallet_address if provided and not T3 admin type
        if (!isT3AdminType && formData.walletAddress && formData.walletAddress.trim()) {
          payload.wallet_address = formData.walletAddress.trim();
        }
        
        console.log('Creating account with payload:', payload);
        const result = await api.t3admin.createAccount(payload);
        
        handleApiResponse(result, {
          successMessage: result?.message || 'Account created successfully!',
          errorMessage: result?.message || 'Failed to create account. Please try again.',
          onSuccess: async () => {
            // Close modal first
            handleCloseModal();
            // Refresh accounts list - go to first page to see the new account
            setCurrentPage(1);
            // Fetch accounts with explicit page 1 to avoid dependency on state
            await fetchAccounts(1, searchTerm);
          }
        });
      } catch (error) {
        console.error('Failed to create account:', error);
        showError('Failed to create account. Please try again.');
        return;
      }
    } else {
      // Edit mode: Update password only
      if (!formData.password || !formData.password.trim()) {
        showError('Password is required');
        return;
      }

      try {
        const result = await api.t3admin.updateAccountPassword(modalState.editingId, {
          password: formData.password.trim()
        });
        
        handleApiResponse(result, {
          successMessage: result?.message || 'Account password reset successfully',
          errorMessage: result?.message || 'Failed to update password. Please try again.',
          onSuccess: () => {
            handleCloseModal();
            // Refresh accounts list to ensure data is up to date
            fetchAccounts(currentPage, searchTerm);
          }
        });
      } catch (error) {
        console.error('Failed to update password:', error);
        showError('Failed to update password. Please try again.');
      }
      return;
    }
  };

  const handleDelete = (account) => {
    console.log('Deleting account:', account.id);
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleToggleStatus = useCallback(async (account) => {
    if (!isT3Admin) return;
    
    const currentStatus = account.status?.toLowerCase() || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const result = await api.t3admin.updateAccountStatus(account.id, { status: newStatus });
      
      if (result && result.success) {
        // Optimistically update the local state immediately
        setAccountsData(prevData => 
          prevData.map(acc => 
            acc.id === account.id 
              ? { ...acc, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }
              : acc
          )
        );
        
        handleApiResponse(result, {
          successMessage: result?.message || 'Account status updated successfully',
          errorMessage: result?.message || 'Failed to update account status. Please try again.',
          onSuccess: async () => {
            // Refresh accounts list from server to ensure consistency
            await fetchAccounts(currentPage, searchTerm);
          }
        });
      } else {
        showError(result?.message || 'Failed to update account status. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update account status:', error);
      showError('Failed to update account status. Please try again.');
    }
  }, [isT3Admin, currentPage, searchTerm, handleApiResponse, showError]);

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

    // T3 admin: replace delete with active/inactive toggle
    if (isT3Admin) {
      return [
        ...baseActions,
        {
          icon: (row) => {
            const isActive = row.status?.toLowerCase() === 'active';
            return isActive ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <XCircle size={16} className="text-red-600" />
            );
          },
          onClick: (row) => handleToggleStatus(row),
          tooltip: (row) => {
            const isActive = row.status?.toLowerCase() === 'active';
            return isActive ? 'Deactivate Account' : 'Activate Account';
          },
          variant: (row) => {
            const isActive = row.status?.toLowerCase() === 'active';
            return isActive ? 'success' : 'danger';
          },
        },
      ];
    }

    return [
      ...baseActions,
      {
        icon: <Trash2 size={16} />,
        onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
        variant: 'danger',
        tooltip: 'Delete Account',
      },
    ];
  }, [navigate, basePath, isT3Admin, handleToggleStatus]);

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
              placeholder={modalState.mode === 'edit' ? 'Enter new password' : 'Insert password'}
            />
          </FormField>

          {/* Create Finance: show email + wallet address (only if not T3 admin type) */}
          {modalState.mode === 'create' && (
            <>
              <FormField label="Email">
                <TextInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Insert email"
                />
              </FormField>

              {/* Hide wallet address field for T3 Admin (admin_type=t3) */}
              {!isT3AdminType && (
                <FormField label="Wallet Address">
                  <TextInput
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    placeholder="Insert wallet address"
                  />
                </FormField>
              )}
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
