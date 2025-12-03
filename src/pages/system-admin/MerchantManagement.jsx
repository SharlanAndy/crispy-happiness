import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, AddMerchantModal, ProfitChart } from '../../components/ui';

export default function MerchantManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTier, setActiveTier] = useState('T1');

  const isSystemAdmin = location.pathname.includes('system-admin');
  const itemsPerPage = 10;

  const allMerchants = [
    // T1 Merchants
    { id: 'Mer12341', name: 'Food Merchant Sdn Bhd', type: 'F&B', state: 'Johor', join: '01-11-2025 13:00', status: 'Active', tier: 'T1' },
    { id: 'Mer12342', name: 'Grocery Store X', type: 'Retail', state: 'Selangor', join: '02-11-2025 10:30', status: 'Active', tier: 'T1' },
    { id: 'Mer12348', name: 'Coffee Shop A', type: 'F&B', state: 'Penang', join: '07-11-2025 13:00', status: 'Active', tier: 'T1' },
    { id: 'Mer12349', name: 'Mini Market B', type: 'Retail', state: 'Kuala Lumpur', join: '08-11-2025 10:30', status: 'Active', tier: 'T1' },
    { id: 'Mer12350', name: 'Restaurant C', type: 'F&B', state: 'Johor', join: '09-11-2025 09:00', status: 'Active', tier: 'T1' },
    { id: 'Mer12351', name: 'Convenience Store D', type: 'Retail', state: 'Selangor', join: '10-11-2025 15:45', status: 'Active', tier: 'T1' },
    { id: 'Mer12352', name: 'Bakery E', type: 'F&B', state: 'Penang', join: '11-11-2025 11:00', status: 'Active', tier: 'T1' },
    { id: 'Mer12353', name: 'Supermarket F', type: 'Retail', state: 'Kuala Lumpur', join: '12-11-2025 14:30', status: 'Active', tier: 'T1' },
    { id: 'Mer12354', name: 'Cafe G', type: 'F&B', state: 'Johor', join: '13-11-2025 13:00', status: 'Active', tier: 'T1' },
    { id: 'Mer12355', name: 'Pharmacy H', type: 'Healthcare', state: 'Selangor', join: '14-11-2025 10:30', status: 'Active', tier: 'T1' },
    { id: 'Mer12356', name: 'Fast Food I', type: 'F&B', state: 'Penang', join: '15-11-2025 09:00', status: 'Active', tier: 'T1' },
    { id: 'Mer12357', name: 'Bookstore J', type: 'Retail', state: 'Kuala Lumpur', join: '16-11-2025 15:45', status: 'Active', tier: 'T1' },
    
    // T2 Merchants
    { id: 'Mer12343', name: 'Bakery Delight', type: 'F&B', state: 'Penang', join: '03-11-2025 09:00', status: 'Active', tier: 'T2' },
    { id: 'Mer12344', name: 'Tech Gadgets Hub', type: 'Electronics', state: 'Kuala Lumpur', join: '04-11-2025 15:45', status: 'Active', tier: 'T2' },
    { id: 'Mer12358', name: 'Fashion Boutique K', type: 'Fashion', state: 'Johor', join: '17-11-2025 11:00', status: 'Active', tier: 'T2' },
    { id: 'Mer12359', name: 'Electronics Store L', type: 'Electronics', state: 'Selangor', join: '18-11-2025 14:30', status: 'Active', tier: 'T2' },
    { id: 'Mer12360', name: 'Spa Center M', type: 'Beauty & Wellness', state: 'Penang', join: '19-11-2025 13:00', status: 'Active', tier: 'T2' },
    { id: 'Mer12361', name: 'Gym Fitness N', type: 'Sports & Fitness', state: 'Kuala Lumpur', join: '20-11-2025 10:30', status: 'Active', tier: 'T2' },
    { id: 'Mer12362', name: 'Hotel O', type: 'Hospitality', state: 'Johor', join: '21-11-2025 09:00', status: 'Active', tier: 'T2' },
    { id: 'Mer12363', name: 'Mobile Shop P', type: 'Electronics', state: 'Selangor', join: '22-11-2025 15:45', status: 'Active', tier: 'T2' },
    { id: 'Mer12364', name: 'Salon Q', type: 'Beauty & Wellness', state: 'Penang', join: '23-11-2025 11:00', status: 'Active', tier: 'T2' },
    { id: 'Mer12365', name: 'Sports Store R', type: 'Sports & Fitness', state: 'Kuala Lumpur', join: '24-11-2025 14:30', status: 'Active', tier: 'T2' },
    
    // T3 Merchants
    { id: 'Mer12345', name: 'Premium Boutique', type: 'Fashion', state: 'Kuala Lumpur', join: '05-11-2025 11:00', status: 'Active', tier: 'T3' },
    { id: 'Mer12346', name: 'Luxury Cars Dealer', type: 'Automotive', state: 'Selangor', join: '06-11-2025 14:30', status: 'Active', tier: 'T3' },
    { id: 'Mer12347', name: 'Five Star Hotel S', type: 'Hospitality', state: 'Kuala Lumpur', join: '25-11-2025 13:00', status: 'Active', tier: 'T3' },
    { id: 'Mer12366', name: 'Luxury Watch Store T', type: 'Fashion', state: 'Selangor', join: '26-11-2025 10:30', status: 'Active', tier: 'T3' },
    { id: 'Mer12367', name: 'Premium Car Service U', type: 'Automotive', state: 'Kuala Lumpur', join: '27-11-2025 09:00', status: 'Active', tier: 'T3' },
    { id: 'Mer12368', name: 'High-end Restaurant V', type: 'F&B', state: 'Selangor', join: '28-11-2025 15:45', status: 'Active', tier: 'T3' },
    { id: 'Mer12369', name: 'Jewelry Store W', type: 'Fashion', state: 'Kuala Lumpur', join: '29-11-2025 11:00', status: 'Active', tier: 'T3' },
    { id: 'Mer12370', name: 'Luxury Resort X', type: 'Hospitality', state: 'Penang', join: '30-11-2025 14:30', status: 'Active', tier: 'T3' },
  ];

  // Filter by tier and search term
  const filteredMerchants = allMerchants.filter(m =>
    m.tier === activeTier && (
      searchTerm === '' || ['id', 'name', 'type', 'state'].some(k => m[k].toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const merchants = filteredMerchants.slice(startIndex, endIndex);

  const stats = [
    { label: 'Total T1 Merchants', value: '60', lastUpdate: '17-11-2025' },
    { label: 'Total T2 Merchants', value: '30', lastUpdate: '17-11-2025' },
    { label: 'Total T3 Merchants', value: '10', lastUpdate: '17-11-2025' },
  ];

  const columns = [
    { key: 'id', label: 'Mer. ID' },
    { key: 'name', label: 'Com. Name' },
    { key: 'type', label: 'Type' },
    { key: 'state', label: 'State' },
    { key: 'join', label: 'Join Date' },
    { key: 'status', label: 'Status' },
  ];

  const handleDelete = (merchant) => {
    console.log('Deleting merchant:', merchant.id);
  };

  const handleMerchantSubmit = (merchantData) => {
    console.log('Creating merchant account...', merchantData);
    setShowAddModal(false);
  };

  const handleTierChange = (tier) => {
    setActiveTier(tier);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const actions = [
    { icon: <Eye size={16} />, onClick: row => navigate(`${isSystemAdmin ? '/system-admin' : '/t3-admin'}/merchants/${row.id}`), tooltip: 'View Details' },
    { icon: <Settings size={16} />, onClick: row => navigate(isSystemAdmin ? `/system-admin/merchants/${row.id}/settings` : `/t3-admin/merchants/${row.id}/settings`), tooltip: 'Settings' },
    { icon: <Trash2 size={16} />, onClick: row => setDeleteConfirm({ isOpen: true, item: row }), variant: 'danger', tooltip: 'Delete' },
  ];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Merchant Management"
          description="Manage Merchant Information and Others Details"
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="flex">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            New Merchant
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Merchant List</h2>
              <div className="flex gap-2 bg-[#ECECF0] rounded-full px-2 py-1.5">
                <button
                  onClick={() => handleTierChange('T1')}
                  className={`py-1.5 text-lg rounded-full flex-1 transition-colors ${activeTier === 'T1' ? 'bg-white text-black' : 'hover:bg-white/50'}`}
                >
                  T1 Merchant
                </button>
                <button
                  onClick={() => handleTierChange('T2')}
                  className={`py-1.5 text-lg rounded-full flex-1 transition-colors ${activeTier === 'T2' ? 'bg-white text-black' : 'hover:bg-white/50'}`}
                >
                  T2 Merchant
                </button>
                <button
                  onClick={() => handleTierChange('T3')}
                  className={`py-1.5 text-lg rounded-full flex-1 transition-colors ${activeTier === 'T3' ? 'bg-white text-black' : 'hover:bg-white/50'}`}
                >
                  T3 Merchant
                </button>
              </div>
              <SearchBar
                placeholder="Search Merchant..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
              <DataTable
                columns={columns}
                data={merchants}
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

      <AddMerchantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleMerchantSubmit}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteConfirm.item)}
        title="Delete Merchant"
        message={`Are you sure you want to delete ${deleteConfirm.item?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
