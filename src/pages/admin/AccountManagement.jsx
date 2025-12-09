import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, Modal, Button, FormField, ConfirmDialog } from '../../components/ui';
import { TextInput, PasswordInput } from '../../components/form';
import { filterAndPaginate } from '@/lib/pagination';
import { t3Service } from '@/services/t3Service';

const ITEMS_PER_PAGE = 10;
const SEARCH_KEYS = ['id', 'username', 'character', 'status'];

// Removed ALL_ACCOUNTS mock data - using real API data only

const STATS = [
  { label: 'Total Account User', value: '5', lastUpdate: '17-11-2025' },
];

const COLUMNS = [
  { key: 'id', label: 'Admin ID' },
  { key: 'username', label: 'Username' },
  { key: 'character', label: 'Character' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'created', label: 'Create On' },
  { key: 'status', label: 'Status' },
];

export default function AccountManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', editingId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [accountsData, setAccountsData] = useState([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
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
        // Fetch all accounts (no search param - using client-side fuzzy search)
        const result = await t3Service.getAccounts({ page: 1, search: '' }); // Fetch all, filter client-side
        if (result.success) {
          // Transform API data to match table format
          const transformed = result.data.map(acc => ({
            id: acc.id.toString(),
            username: acc.username,
            character: acc.character || 'Finance',
            lastLogin: acc.last_login ? new Date(acc.last_login).toLocaleString('en-GB') : 'Never',
            created: acc.created_at ? new Date(acc.created_at).toLocaleString('en-GB') : '',
            status: acc.status || 'Active'
          }));
          setAccountsData(transformed);
          setTotalAccounts(result.total || transformed.length);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        setAccountsData(ALL_ACCOUNTS);
        setTotalAccounts(ALL_ACCOUNTS.length);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [currentPage, searchTerm, isT3Admin]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const { data: accounts, totalPages } = useMemo(
    () => filterAndPaginate(accountsData, searchTerm, SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [accountsData, searchTerm, currentPage]
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
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
      if (isT3Admin) {
        try {
          const result = await t3Service.createAccount({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            wallet_address: formData.walletAddress
          });
          if (result.success) {
            // Refresh accounts list
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
        } catch (error) {
          console.error('Failed to create account:', error);
          alert('Failed to create account. Please try again.');
          return;
        }
      } else {
        console.log('Creating finance account:', formData);
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

  const actions = useMemo(() => [
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
    {
      icon: <Trash2 size={16} />,
      onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
      variant: 'danger',
      tooltip: 'Delete Account',
    },
  ], [navigate, basePath]);

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
            />
          </FormField>

          <FormField label="Password">
            <PasswordInput
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={modalState.mode === 'edit' ? 'Leave blank to keep current password' : 'Insert password'}
            />
          </FormField>

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
