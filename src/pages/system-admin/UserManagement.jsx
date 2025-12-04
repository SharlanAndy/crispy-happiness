import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2 } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';

const ITEMS_PER_PAGE = 10;
const USER_SEARCH_KEYS = ['id', 'status', 'spend', 'bonus', 'join'];

export default function UserManagement() {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const allUsers = [
    { id: 'U1234567890', spend: '10,000.00 U', bonus: '10.00 U', join: '01-11-2025 13:00', status: 'Active' },
    { id: 'U1234567891', spend: '5,000.00 U', bonus: '5.00 U', join: '02-11-2025 14:00', status: 'Active' },
    { id: 'U1234567892', spend: '2,500.00 U', bonus: '2.50 U', join: '03-11-2025 15:00', status: 'Active' },
    { id: 'U1234567893', spend: '15,000.00 U', bonus: '15.00 U', join: '04-11-2025 16:00', status: 'Active' },
    { id: 'U1234567894', spend: '7,500.00 U', bonus: '7.50 U', join: '05-11-2025 17:00', status: 'Active' },
  ];

  // Apply search and pagination
  const { data: users, totalPages } = useMemo(
    () => filterAndPaginate(allUsers, searchTerm, USER_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [searchTerm, currentPage]
  );

  const stats = [
    { label: 'Total Active User', value: '23', lastUpdate: '17-11-2025' },
    { label: 'Total Bonus Distributed', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Total Spending Volume', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
  ];

  const columns = [
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

  const actions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/system-admin/users/${row.id}`),
      tooltip: 'View Details',
    },
    {
      icon: <Settings size={16} />,
      onClick: (row) => navigate(`/system-admin/users/${row.id}/settings`),
      tooltip: 'Settings',
    },
    {
      icon: <Trash2 size={16} />,
      onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
      variant: 'danger',
      tooltip: 'Delete',
    },
  ];

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
    </>
  );
}
