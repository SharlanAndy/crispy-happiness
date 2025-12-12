import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, ArrowRightLeft } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, TransferModal } from '../../components/ui';
import { t3Service } from '@/services/t3Service';
import { api } from '@/lib/api';

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [transferModal, setTransferModal] = useState({ isOpen: false, user: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [usersMeta, setUsersMeta] = useState(null); // Store metadata from users endpoint
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, limit: 20, page: 1 }); // Store pagination metadata

  // Detect if accessed from T3 Admin or System Admin
  const isT3Admin = location.pathname.startsWith('/t3-admin');
  const basePath = isT3Admin ? '/t3-admin' : '/system-admin';

  // Fetch stats from page 1 on initial load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isT3Admin) {
          const statsResult = await t3Service.getUsers({ page: 1 });
          if (statsResult.success) {
            // Store metadata from page 1 for stats
            setUsersMeta(statsResult.meta || statsResult);
          }
        } else {
          const statsResult = await api.systemadmin.getUsers({ page: 1 });
          if (statsResult && statsResult.success) {
            // Store metadata from page 1 for stats
            setUsersMeta(statsResult.meta || statsResult);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, [isT3Admin]);

  // Fetch users data for T3 Admin or System Admin
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Build params object, only include search if it has a value
        const params = { page: currentPage };
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        
        if (isT3Admin) {
          // Fetch users with search parameter
          const usersResult = await t3Service.getUsers(params);

          if (usersResult.success) {
            const transformed = usersResult.data.map(user => ({
              id: user.id,
              walletId: user.wallet_id || 'N/A',
              amount: `${(user.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              join: user.join_time ? new Date(user.join_time).toLocaleString('en-GB') : 'N/A',
              status: user.status || 'Active'
            }));
            setUsersData(transformed);
            
            // Store pagination metadata
            const limit = usersResult.limit || usersResult.meta?.limit || 20;
            const total = usersResult.total || usersResult.meta?.total;
            const page = usersResult.page || usersResult.meta?.page || currentPage;
            
            setPaginationMeta({
              total: total !== undefined ? total : (usersResult.data.length < limit ? (page - 1) * limit + usersResult.data.length : null),
              limit: limit,
              page: page
            });
          }
        } else {
          // System Admin - fetch from systemadmin API
          const usersResult = await api.systemadmin.getUsers(params);

          if (usersResult && usersResult.success) {
            const transformed = usersResult.data.map(user => ({
              id: user.id || 'N/A',
              spend: `${(user.total_spend || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              bonus: `${(user.total_bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              join: user.join_time ? new Date(user.join_time).toLocaleString('en-GB') : 'N/A',
              status: user.status || 'Active'
            }));
            setUsersData(transformed);
            
            // Store pagination metadata
            const limit = usersResult.limit || usersResult.meta?.limit || 20;
            const total = usersResult.total || usersResult.meta?.total;
            const page = usersResult.page || usersResult.meta?.page || currentPage;
            
            setPaginationMeta({
              total: total !== undefined ? total : (usersResult.data.length < limit ? (page - 1) * limit + usersResult.data.length : null),
              limit: limit,
              page: page
            });
          } else {
            setUsersData([]);
            setPaginationMeta({ total: 0, limit: 20, page: 1 });
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

  // Calculate total pages from API pagination metadata
  const totalPages = useMemo(() => {
    // If API provides total, use it to calculate pages
    if (paginationMeta.total !== null && paginationMeta.total !== undefined && paginationMeta.total > 0) {
      return Math.ceil(paginationMeta.total / paginationMeta.limit) || 1;
    }
    
    // If total is not provided, use heuristic based on data length vs limit:
    // - If data.length < limit: This is the last page (e.g., 19 items with limit 20 = 1 page)
    // - If data.length === limit: There might be more pages, show at least current + 1
    if (usersData.length > 0) {
      if (usersData.length < paginationMeta.limit) {
        // Fewer items than limit means this is the last page
        return paginationMeta.page;
      } else if (usersData.length === paginationMeta.limit) {
        // Full page of data, there might be more pages
        // Show at least current page + 1, but will adjust when user navigates
        return paginationMeta.page + 1;
      }
    }
    
    // Default to 1 page if no data
    return 1;
  }, [paginationMeta, usersData.length]);

  // Use data directly from API (server-side pagination)
  const users = usersData;

  // Extract stats from users endpoint response
  const stats = useMemo(() => {
    // Get last updated date from centralized key, default to today
    const getLastUpdated = () => {
      if (usersMeta) {
        const lastUpdated = usersMeta.last_updated || 
                           usersMeta.updated_at || 
                           usersMeta.last_update ||
                           usersMeta.updated_at_date ||
                           usersMeta.LastUpdated ||
                           usersMeta.UpdatedAt;
        
        if (lastUpdated) {
          try {
            return new Date(lastUpdated).toLocaleDateString('en-GB');
          } catch (e) {
            console.warn('Failed to parse last_updated date:', e);
          }
        }
      }
      // Default to today's date
      return new Date().toLocaleDateString('en-GB');
    };

    const lastUpdate = getLastUpdated();

    // Extract values from users endpoint response, default to 0
    const totalActiveUsers = usersMeta?.total_users || 
                             usersMeta?.total_active_users || 
                             usersMeta?.TotalUsers ||
                             usersMeta?.TotalActiveUsers ||
                             0;

    const totalBonusDistributed = usersMeta?.total_bonus_distributed || 
                                  usersMeta?.total_bonus || 
                                  usersMeta?.TotalBonusDistributed ||
                                  usersMeta?.TotalBonus ||
                                  0;

    const totalSpendingVolume = usersMeta?.total_spending_volume || 
                                usersMeta?.total_incoming_funds || 
                                usersMeta?.total_spend ||
                                usersMeta?.TotalSpendingVolume ||
                                usersMeta?.TotalIncomingFunds ||
                                0;

    return [
      { 
        label: 'Total Active User', 
        value: totalActiveUsers.toString(), 
        lastUpdate: lastUpdate 
      },
      { 
        label: 'Total Bonus Distributed', 
        value: `${totalBonusDistributed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
        lastUpdate: lastUpdate 
      },
      { 
        label: 'Total Spending Volume', 
        value: `${totalSpendingVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
        lastUpdate: lastUpdate 
      },
    ];
  }, [usersMeta]);

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
