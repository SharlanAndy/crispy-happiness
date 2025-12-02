import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, Modal, ConfirmDialog } from '../../components/ui';

export default function MerchantManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTier, setActiveTier] = useState('T1');

  const isSystemAdmin = location.pathname.includes('system-admin');

  const allMerchants = [
    { id: 'Mer12341', name: 'Food Merchant Sdn Bhd', type: 'F&B', state: 'Johor', join: '01-11-2025 13:00', status: 'Active', tier: 'T1' },
    { id: 'Mer12343', name: 'Grocery Store X', type: 'Retail', state: 'Selangor', join: '02-11-2025 10:30', status: 'Active', tier: 'T1' },
    { id: 'Mer12344', name: 'Bakery Delight', type: 'F&B', state: 'Penang', join: '03-11-2025 09:00', status: 'Active', tier: 'T2' },
    { id: 'Mer12345', name: 'Tech Gadgets Hub', type: 'Electronics', state: 'Kuala Lumpur', join: '04-11-2025 15:45', status: 'Active', tier: 'T2' },
    { id: 'Mer12346', name: 'Premium Boutique', type: 'Fashion', state: 'Kuala Lumpur', join: '05-11-2025 11:00', status: 'Active', tier: 'T3' },
    { id: 'Mer12347', name: 'Luxury Cars Dealer', type: 'Automotive', state: 'Selangor', join: '06-11-2025 14:30', status: 'Active', tier: 'T3' },
  ];

  // Filter by tier and search term (compact)
  const merchants = allMerchants.filter(m =>
    m.tier === activeTier && (
      searchTerm === '' || ['id', 'name', 'type', 'state'].some(k => m[k].toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

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
    // TODO: Call API to delete merchant
    console.log('Deleting merchant:', merchant.id);
    // api.merchant.delete(merchant.id);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Merchant List</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTier('T1')}
                  className={`px-3 py-1 text-sm border rounded-lg transition-colors ${activeTier === 'T1' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                >
                  T1 Merchant
                </button>
                <button
                  onClick={() => setActiveTier('T2')}
                  className={`px-3 py-1 text-sm border rounded-lg transition-colors ${activeTier === 'T2' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                >
                  T2 Merchant
                </button>
                <button
                  onClick={() => setActiveTier('T3')}
                  className={`px-3 py-1 text-sm border rounded-lg transition-colors ${activeTier === 'T3' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                >
                  T3 Merchant
                </button>
              </div>
            </div>
            <SearchBar
              placeholder="Search Merchant..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="max-w-sm"
            />
          </div>

          <DataTable
            columns={columns}
            data={merchants}
            actions={actions}
            pagination={{
              currentPage,
              totalPages: 3,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Merchant"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border rounded-lg hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // TODO: Implement create merchant logic
                console.log('Creating merchant account...');
                setShowAddModal(false);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Create Account
            </button>
          </>
        }
      >
        <div className="space-y-8">
          {/* Merchant's Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Merchant's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input type="text" placeholder="Insert company name here" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SSM Number</label>
                <input type="text" placeholder="Insert SSM number here" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Merchant's Type</label>
                <select className="w-full px-3 py-2 rounded-lg border bg-background">
                  <option>Select type of business</option>
                  <option>F&B</option>
                  <option>Retail</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Merchant's Group</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="group" value="T1" /> T1
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="group" value="T2" /> T2
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="group" value="T3" /> T3
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" placeholder="Insert email here" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" placeholder="Insert password here" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
            </div>
          </section>

          {/* Business Address */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Business Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                <input type="text" placeholder="Insert address line 1 here" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input type="text" placeholder="Insert address line 2 here" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input type="text" placeholder="Insert city name here" className="w-full px-3 py-2 rounded-lg border bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background">
                    <option>Select State</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background">
                    <option>Select Country</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Wallet Setup */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Wallet Setup</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Wallet Address</label>
              <input type="text" placeholder="Insert wallet address here" className="w-full px-3 py-2 rounded-lg border bg-background" />
            </div>
          </section>

          {/* Sponsor Setup */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Sponsor Setup</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Sponsor By</label>
              <input type="text" placeholder="Insert referral ID here" className="w-full px-3 py-2 rounded-lg border bg-background" />
            </div>
          </section>

          {/* Fees Setup */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Fees Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Markup Fees (%)</label>
                <input type="text" placeholder="eg: 1.2" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Processing Fees (%)</label>
                <input type="text" placeholder="eg: 1.2" className="w-full px-3 py-2 rounded-lg border bg-background" />
              </div>
            </div>
          </section>
        </div>
      </Modal>

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
