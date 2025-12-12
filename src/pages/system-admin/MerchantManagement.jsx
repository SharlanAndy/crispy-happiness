import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, AddMerchantModal } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
  MERCHANT_STATS,
  MERCHANT_COLUMNS,
  MERCHANT_TIERS,
  MERCHANT_SEARCH_KEYS,
} from '../../constant/merchantMockData';

const ITEMS_PER_PAGE = 10;

export default function MerchantManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTier, setActiveTier] = useState('T1');
  const [loading, setLoading] = useState(true);
  const [merchantsData, setMerchantsData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const { handleApiResponse, showError } = useToast();

  const isSystemAdmin = location.pathname.includes('system-admin');

  // Fetch merchants data
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const [merchantsResult, dashboardResult] = await Promise.all([
          api.systemadmin.getMerchants({ page: 1 }), // Fetch all, filter client-side
          api.systemadmin.getDashboard()
        ]);

        if (merchantsResult && merchantsResult.success) {
          const transformed = merchantsResult.data.map(m => ({
            id: m.id,
            merchant_id: m.merchant_id || `MER${m.id}`,
            name: m.company_name || 'N/A', // Column expects 'name' but API provides 'company_name'
            type: m.type || 'N/A',
            state: m.state || m.location?.state || '', // API might provide state in location object
            join: m.join_date ? new Date(m.join_date).toLocaleString('en-GB') : 'N/A', // Column expects 'join' but transformation was creating 'join_date'
            status: m.status || 'Active',
            tier: m.type === 't1' || m.type === 'merchant' ? 'T1' : m.type === 't2' ? 'T2' : m.type === 't3' ? 'T3' : 'T1'
          }));
          setMerchantsData(transformed);
        } else {
          setMerchantsData([]);
        }

        if (dashboardResult && dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch merchants:', error);
        setMerchantsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Filter merchants by tier first
  const tierFilteredMerchants = useMemo(
    () => merchantsData.filter(m => m.tier === activeTier),
    [merchantsData, activeTier]
  );

  // Apply search and pagination
  const { data: merchants, totalPages } = useMemo(
    () => filterAndPaginate(tierFilteredMerchants, searchTerm, MERCHANT_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [tierFilteredMerchants, searchTerm, currentPage]
  );

  // Handlers
  const handleDelete = (merchant) => {
    console.log('Deleting merchant:', merchant.id);
  };

  const handleMerchantSubmit = async (merchantData) => {
    try {
      // Transform form data to match API expected format
      const apiData = {
        email: merchantData.email,
        password: merchantData.password,
        company_name: merchantData.companyName,
        ssm_number: merchantData.ssmNumber,
        merchant_type: merchantData.merchantType,
        merchant_group: merchantData.merchantGroup, // T1, T2, or T3
        address: {
          line1: merchantData.addressLine1,
          line2: merchantData.addressLine2 || '',
          city: merchantData.city,
          postcode: merchantData.postcode,
          state: merchantData.state,
          country: merchantData.country,
        },
        wallet_address: merchantData.walletAddress,
        sponsor_id: merchantData.referralBy || '',
        referral_fees: merchantData.referralFees ? parseFloat(merchantData.referralFees) : 0,
        referral_remarks: merchantData.referralRemarks || '',
        fees: {
          markup: merchantData.markupFees ? parseFloat(merchantData.markupFees) : 0,
          processing: merchantData.processingFees ? parseFloat(merchantData.processingFees) : 0,
        },
        currency: merchantData.currencies,
      };

      const result = await api.systemadmin.createMerchant(apiData);
      
      // Handle API response with toast
      handleApiResponse(result, {
        successMessage: 'Merchant created successfully!',
        errorMessage: result?.message || 'Failed to create merchant. Please try again.',
      });

      if (result && result.success) {
        // Refresh merchant list
        const [merchantsResult, dashboardResult] = await Promise.all([
          api.systemadmin.getMerchants({ page: 1 }),
          api.systemadmin.getDashboard()
        ]);

        if (merchantsResult && merchantsResult.success) {
          const transformed = merchantsResult.data.map(m => ({
            id: m.id,
            merchant_id: m.merchant_id || `MER${m.id}`,
            name: m.company_name || 'N/A',
            type: m.type || 'N/A',
            state: m.state || m.location?.state || '',
            join: m.join_date ? new Date(m.join_date).toLocaleString('en-GB') : 'N/A',
            status: m.status || 'Active',
            tier: m.type === 't1' || m.type === 'merchant' ? 'T1' : m.type === 't2' ? 'T2' : m.type === 't3' ? 'T3' : 'T1'
          }));
          setMerchantsData(transformed);
        }

        if (dashboardResult && dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        }

        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to create merchant:', error);
      showError(error?.message || 'Failed to create merchant. Please try again.');
    }
  };

  const handleTierChange = (tier) => {
    setActiveTier(tier);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Action buttons for table
  const actions = useMemo(() => {
    const basePath = isSystemAdmin ? '/system-admin' : '/t3-admin';
    return [
      { 
        icon: <Eye size={16} />, 
        onClick: row => navigate(`${basePath}/merchants/${row.id}`), 
        tooltip: 'View Details' 
      },
      { 
        icon: <Settings size={16} />, 
        onClick: row => navigate(`${basePath}/merchants/${row.id}/settings`), 
        tooltip: 'Settings' 
      },
      { 
        icon: <Trash2 size={16} />, 
        onClick: row => setDeleteConfirm({ isOpen: true, item: row }), 
        variant: 'danger', 
        tooltip: 'Delete' 
      },
    ];
  }, [isSystemAdmin, navigate]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Merchant Management"
          description="Manage Merchant Information and Others Details"
        />

        {/* Stats Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {dashboardData ? [
            { label: 'Total T1 Merchants', value: dashboardData.total_t1_merchants?.toString() || '0', lastUpdate: new Date().toLocaleDateString('en-GB') },
            { label: 'Total T2 Merchants', value: dashboardData.total_t2_merchants?.toString() || '0', lastUpdate: new Date().toLocaleDateString('en-GB') },
            { label: 'Total T3 Merchants', value: dashboardData.total_t3_merchants?.toString() || '0', lastUpdate: new Date().toLocaleDateString('en-GB') },
          ].map((stat, i) => <StatCard key={i} {...stat} />) : MERCHANT_STATS.map((stat, i) => <StatCard key={i} {...stat} />)}
        </div>

        {/* New Merchant Button */}
        <div className="flex">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            New Merchant
          </button>
        </div>

        {/* Merchant List Section */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Merchant List</h2>
              
              {/* Tier Filter Tabs */}
              <div className="flex gap-2 bg-[#ECECF0] rounded-full px-2 py-1.5">
                {MERCHANT_TIERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleTierChange(tier)}
                    className={`py-1.5 text-lg rounded-full flex-1 transition-colors ${
                      activeTier === tier ? 'bg-white text-black' : 'hover:bg-white/50'
                    }`}
                  >
                    {tier} Merchant
                  </button>
                ))}
              </div>

              {/* Search */}
              <SearchBar
                placeholder="Search Merchant..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />

              {/* Data Table */}
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading merchants...</p>
                </div>
              ) : merchants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No merchants found</p>
                </div>
              ) : (
                <DataTable
                  columns={MERCHANT_COLUMNS}
                  data={merchants}
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
