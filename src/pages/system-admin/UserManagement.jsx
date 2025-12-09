import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, ArrowRightLeft } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, TransferModal } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { t3Service } from '@/services/t3Service';
import { api } from '@/lib/api';

const ITEMS_PER_PAGE = 10;
const USER_SEARCH_KEYS = ['id', 'status', 'spend', 'bonus', 'join'];

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [transferModal, setTransferModal] = useState({ isOpen: false, user: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [statsData, setStatsData] = useState(null);

  // Detect if accessed from T3 Admin or System Admin
  const isT3Admin = location.pathname.startsWith('/t3-admin');
  const basePath = isT3Admin ? '/t3-admin' : '/system-admin';

  // Fetch users data for T3 Admin or System Admin
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        if (isT3Admin) {
          // Fetch all users (no search param - using client-side fuzzy search)
          const [usersResult, dashboardResult] = await Promise.all([
            t3Service.getUsers({ page: 1, search: '' }), // Fetch all, filter client-side
            t3Service.getDashboard()
          ]);

          if (usersResult.success) {
            const transformed = usersResult.data.map(user => ({
              id: user.id,
              walletId: user.wallet_id || 'N/A',
              amount: `${(user.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              join: user.join_time ? new Date(user.join_time).toLocaleString('en-GB') : 'N/A',
              status: user.status || 'Active'
            }));
            setUsersData(transformed);
          }

          if (dashboardResult.success) {
            setStatsData(dashboardResult.data);
          }
        } else {
          // System Admin - fetch from systemadmin API
          const [usersResult, dashboardResult] = await Promise.all([
            api.systemadmin.getUsers({ page: 1 }), // Fetch all, filter client-side
            api.systemadmin.getDashboard()
          ]);

          if (usersResult && usersResult.success) {
            const transformed = usersResult.data.map(user => ({
              id: user.id || 'N/A',
              spend: `${(user.total_spend || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              bonus: `${(user.total_bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              join: user.join_time ? new Date(user.join_time).toLocaleString('en-GB') : 'N/A',
              status: user.status || 'Active'
            }));
            setUsersData(transformed);
          } else {
            setUsersData([]);
          }

          if (dashboardResult && dashboardResult.success) {
            setStatsData(dashboardResult.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsersData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, searchTerm, isT3Admin]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Apply search and pagination
  const { data: users, totalPages } = useMemo(
    () => filterAndPaginate(usersData, searchTerm, USER_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [usersData, searchTerm, currentPage]
  );

  const stats = statsData ? [
    { label: 'Total Active User', value: statsData.total_users?.toString() || '0', lastUpdate: new Date().toLocaleDateString('en-GB') },
    { label: 'Total Bonus Distributed', value: 'N/A', lastUpdate: new Date().toLocaleDateString('en-GB') }, // TODO: Add bonus API
    { label: 'Total Spending Volume', value: `${(statsData.total_incoming_funds || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
  ] : [
    { label: 'Total Active User', value: '23', lastUpdate: '17-11-2025' },
    { label: 'Total Bonus Distributed', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Total Spending Volume', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
  ];

  // Different columns for T3 Admin vs System Admin
  const columns = isT3Admin ? [
    { key: 'id', label: 'U.ID' },
    { key: 'walletId', label: 'Wallet ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'join', label: 'Join Time' },
    { key: 'status', label: 'Status' },
  ] : [
    { key: 'id', label: 'U.ID' },
    { key: 'spend', label: 'Total Spend' },
    { key: 'bonus', label: 'Total Bonus' },
    { key: 'join', label: 'Join Time' },
    { key: 'status', label: 'Status' },
  ];

  const handleDelete = (user) => {
    console.log('Deleting user:', user.id);
    // TODO: api.user.delete(user.id);
  };

  // Different actions for T3 Admin vs System Admin
  const actions = useMemo(() => {
    if (isT3Admin) {
      return [
        {
          icon: <Eye size={16} />,
          onClick: (row) => navigate(`${basePath}/users/${row.id}`),
          tooltip: 'View Details',
        },
        {
          icon: <ArrowRightLeft size={16} />,
          onClick: (row) => setTransferModal({ isOpen: true, user: row }),
          tooltip: 'Transfer',
        },
        {
          icon: <Settings size={16} />,
          onClick: (row) => navigate(`${basePath}/users/${row.id}/settings`),
          tooltip: 'Edit',
        },
        {
          icon: <Trash2 size={16} />,
          onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
          variant: 'danger',
          tooltip: 'Delete',
        },
      ];
    }
    
    return [
      {
        icon: <Eye size={16} />,
        onClick: (row) => navigate(`${basePath}/users/${row.id}`),
        tooltip: 'View Details',
      },
      {
        icon: <Settings size={16} />,
        onClick: (row) => navigate(`${basePath}/users/${row.id}/settings`),
        tooltip: 'Settings',
      },
      {
        icon: <Trash2 size={16} />,
        onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
        variant: 'danger',
        tooltip: 'Delete',
      },
    ];
  }, [isT3Admin, navigate, basePath]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Overview the Details of User Information"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold ">User List</h2>
              <SearchBar
                placeholder="Search User..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="max-w-sm"
              />

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={users}
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
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteConfirm.item)}
        title="Delete User"
        message={`Are you sure you want to delete user ${deleteConfirm.item?.id}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <TransferModal
        isOpen={transferModal.isOpen}
        onClose={() => setTransferModal({ isOpen: false, user: null })}
        user={transferModal.user}
      />
    </>
  );
}
