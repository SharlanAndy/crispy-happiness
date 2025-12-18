import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, AddMerchantModal } from '../../components/ui';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
  MERCHANT_STATS,
  MERCHANT_COLUMNS,
  MERCHANT_TIERS,
  MERCHANT_SEARCH_KEYS,
} from '../../constant/merchantMockData';

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
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState({ limit: 20, page: 1, total: null });
  const [summaryStats, setSummaryStats] = useState({
    t1: { count: 0, lastUpdate: null },
    t2: { count: 0, lastUpdate: null },
    t3: { count: 0, lastUpdate: null },
  });
  const { handleApiResponse, showError } = useToast();

  const isSystemAdmin = location.pathname.includes('system-admin');

  // Map tier to API type parameter
  const getTypeFromTier = (tier) => {
    const tierMap = {
      'T1': 't1',
      'T2': 't2',
      'T3': 't3',
      'Merchant': 'merchant'
    };
    return tierMap[tier] || 't1';
  };

  // Helper function to safely format date
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return new Date().toLocaleDateString('en-GB');
    }
    
    // If it's already a formatted date string (like "13/12/2025"), return as is
    if (typeof dateValue === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
      return dateValue;
    }
    
    // Try to parse as date
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Invalid date, return today's date
      return new Date().toLocaleDateString('en-GB');
    }
    
    // Valid date, format it
    return date.toLocaleDateString('en-GB');
  };

  // Fetch summary stats for T1, T2, T3 from individual endpoints
  useEffect(() => {
    const fetchSummaryStats = async () => {
      try {
        const [t1Result, t2Result, t3Result] = await Promise.all([
          api.systemadmin.getMerchants({ page: 1, type: 't1' }),
          api.systemadmin.getMerchants({ page: 1, type: 't2' }),
          api.systemadmin.getMerchants({ page: 1, type: 't3' }),
        ]);

        const today = new Date().toLocaleDateString('en-GB');

        setSummaryStats({
          t1: {
            count: t1Result?.total || t1Result?.data?.length || t1Result?.count || 0,
            lastUpdate: t1Result?.last_update || t1Result?.lastUpdate || t1Result?.updated_at || today,
          },
          t2: {
            count: t2Result?.total || t2Result?.data?.length || t2Result?.count || 0,
            lastUpdate: t2Result?.last_update || t2Result?.lastUpdate || t2Result?.updated_at || today,
          },
          t3: {
            count: t3Result?.total || t3Result?.data?.length || t3Result?.count || 0,
            lastUpdate: t3Result?.last_update || t3Result?.lastUpdate || t3Result?.updated_at || today,
          },
        });
      } catch (error) {
        console.error('Failed to fetch summary stats:', error);
        // Fallback to today's date if fetch fails
        const today = new Date().toLocaleDateString('en-GB');
        setSummaryStats({
          t1: { count: 0, lastUpdate: today },
          t2: { count: 0, lastUpdate: today },
          t3: { count: 0, lastUpdate: today },
        });
      }
    };

    fetchSummaryStats();
  }, []); // Fetch once on mount

  // Fetch merchants data based on active tier
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const type = getTypeFromTier(activeTier);
        const merchantsResult = await api.systemadmin.getMerchants({ page: currentPage, type });

        if (merchantsResult && merchantsResult.success) {
          const dataArray = merchantsResult.data || [];
          const limit = merchantsResult.limit || 20;
          const page = merchantsResult.page || currentPage;
          const total = merchantsResult.total || null;
          
          setPaginationMeta({ limit, page, total });
          
          const transformed = dataArray.map(m => ({
            id: m.id, // Keep numeric id for navigation/actions
            merchant_id: m.merchant_id || 'N/A', // Use merchant_id directly from API for display
            name: m.company_name || 'N/A',
            type: m.category || m.Category || m.type ? (m.category || m.Category || m.type).toUpperCase() : 'N/A', // Use category from API, fallback to type
            state: m.state || m.location?.state || '',
            join: m.join_date ? new Date(m.join_date).toLocaleString('en-GB') : 'N/A',
            status: m.status || 'Active',
          }));
          setMerchantsData(transformed);
          
          // Determine if there's a next page
          if (total !== null) {
            // If API provides total count, calculate if there's a next page
            setHasNextPage(page * limit < total);
          } else if (dataArray.length < limit) {
            // Less than limit items means this is the last page
            setHasNextPage(false);
          } else if (dataArray.length === limit && page === 1) {
            // Exactly limit items on page 1 - need to check page 2
            const checkNextPage = async () => {
              try {
                const nextPageResult = await api.systemadmin.getMerchants({ page: 2, type });
                if (nextPageResult && nextPageResult.success) {
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
            // On page 2+ with exactly limit items, there might be more
            const checkNextPage = async () => {
              try {
                const nextPageResult = await api.systemadmin.getMerchants({ page: page + 1, type });
                if (nextPageResult && nextPageResult.success) {
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
          
          // Set total pages from API response if available, otherwise calculate
          if (merchantsResult.total_pages) {
            setTotalPages(merchantsResult.total_pages);
          } else if (merchantsResult.meta?.totalPages) {
            setTotalPages(merchantsResult.meta.totalPages);
          } else if (total !== null) {
            setTotalPages(Math.ceil(total / limit));
          }
          // Note: hasNextPage will be set asynchronously, totalPages will be updated via useEffect
        } else {
          setMerchantsData([]);
          setTotalPages(1);
          setHasNextPage(false);
        }
      } catch (error) {
        console.error('Failed to fetch merchants:', error);
        setMerchantsData([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, [activeTier, currentPage]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate total pages based on pagination metadata and hasNextPage
  useEffect(() => {
    if (paginationMeta.total !== null && paginationMeta.total !== undefined) {
      setTotalPages(Math.ceil(paginationMeta.total / paginationMeta.limit));
    } else if (merchantsData.length < paginationMeta.limit) {
      setTotalPages(paginationMeta.page);
    } else if (merchantsData.length === paginationMeta.limit) {
      setTotalPages(hasNextPage ? paginationMeta.page + 1 : paginationMeta.page);
    }
  }, [paginationMeta, merchantsData.length, hasNextPage]);

  // Apply search filter (client-side search on already filtered API data)
  const filteredMerchants = useMemo(
    () => {
      if (!searchTerm) return merchantsData;
      const searchLower = searchTerm.toLowerCase();
      return merchantsData.filter(m => 
        MERCHANT_SEARCH_KEYS.some(key => {
          const value = m[key];
          return value && value.toString().toLowerCase().includes(searchLower);
        })
      );
    },
    [merchantsData, searchTerm]
  );

  // Handlers
  const handleDelete = (merchant) => {
    console.log('Deleting merchant:', merchant.id);
  };

  const handleMerchantSubmit = async (merchantData) => {
    try {
      // Transform form data to match API expected format (flat structure with snake_case keys)
      const apiData = {
        username: merchantData.username || '',
        email: merchantData.email || '',
        password: merchantData.password || '',
        first_name: merchantData.firstName || '',
        last_name: merchantData.lastName || '',
        phone: merchantData.phone || '',
        business_name: merchantData.companyName || '',
        ssm_number: merchantData.ssmNumber || '',
        merchant_type: merchantData.merchantType || '',
        merchant_group: merchantData.merchantGroup || 'T1',
        category: merchantData.merchantGroup || 'T1', // category should match merchant_group
        address_line1: merchantData.addressLine1 || '',
        address_line2: merchantData.addressLine2 || '',
        city: merchantData.city || '',
        state: merchantData.state || '',
        country: merchantData.country || '',
        postcode: merchantData.postcode || '',
        wallet_address: merchantData.walletAddress || '',
        sponsor_by: merchantData.sponsorBy || '',
        markup_fees: merchantData.markupFees ? parseFloat(merchantData.markupFees) : 0,
        processing_fees: merchantData.processingFees ? parseFloat(merchantData.processingFees) : 0,
        L1_rebate: merchantData.L1Rebate ? parseFloat(merchantData.L1Rebate) : 0,
        L2_rebate: merchantData.L2Rebate ? parseFloat(merchantData.L2Rebate) : 0,
        T1_rebate: merchantData.T1Rebate ? parseFloat(merchantData.T1Rebate) : 0,
        T2_rebate: merchantData.T2Rebate ? parseFloat(merchantData.T2Rebate) : 0,
        Merchant_rebate: merchantData.MerchantRebate ? parseFloat(merchantData.MerchantRebate) : 0,
        DirectRebate: merchantData.DirectRebate ? parseFloat(merchantData.DirectRebate) : 0,
        Shareholder_bonus: merchantData.ShareholderBonus ? parseFloat(merchantData.ShareholderBonus) : 0,
      };

      // Add T3 admin fields if merchant group is T3
      if (merchantData.merchantGroup === 'T3') {
        // Only include T3 admin fields if they are provided (empty strings will trigger auto-generation)
        if (merchantData.t3AdminUsername !== undefined) {
          apiData.t3_admin_username = merchantData.t3AdminUsername || '';
        }
        if (merchantData.t3AdminEmail !== undefined) {
          apiData.t3_admin_email = merchantData.t3AdminEmail || '';
        }
        if (merchantData.t3AdminPassword !== undefined) {
          apiData.t3_admin_password = merchantData.t3AdminPassword || '';
        }
        if (merchantData.t3AdminFirstName !== undefined) {
          apiData.t3_admin_first_name = merchantData.t3AdminFirstName || '';
        }
        if (merchantData.t3AdminLastName !== undefined) {
          apiData.t3_admin_last_name = merchantData.t3AdminLastName || '';
        }
        if (merchantData.t3AdminPhone !== undefined) {
          apiData.t3_admin_phone = merchantData.t3AdminPhone || '';
        }
      }

      // Handle currency_id - extract from currencies field
      // Currency value should now be the ID (string or number)
      if (merchantData.currencies) {
        const currencyId = typeof merchantData.currencies === 'string' 
          ? parseInt(merchantData.currencies, 10) 
          : Number(merchantData.currencies);
        if (!isNaN(currencyId) && currencyId > 0) {
          apiData.currency_id = currencyId;
        } else {
          // Fallback: default to 1 if currency ID cannot be parsed
          apiData.currency_id = 1;
        }
      } else {
        // Default currency_id if not provided
        apiData.currency_id = 1;
      }

      const result = await api.systemadmin.createMerchant(apiData);
      
      // Handle API response with toast
      handleApiResponse(result, {
        successMessage: 'Merchant created successfully!',
        errorMessage: result?.message || 'Failed to create merchant. Please try again.',
      });

      if (result && result.success) {
        // Refresh merchant list for current tier
        const type = getTypeFromTier(activeTier);
        const merchantsResult = await api.systemadmin.getMerchants({ page: currentPage, type });

        if (merchantsResult && merchantsResult.success) {
          const transformed = merchantsResult.data.map(m => ({
            id: m.id, // Keep numeric id for navigation/actions
            merchant_id: m.merchant_id || 'N/A', // Use merchant_id directly from API for display
            name: m.company_name || 'N/A',
            type: m.category || m.Category || m.type ? (m.category || m.Category || m.type).toUpperCase() : 'N/A', // Use category from API, fallback to type
            state: m.state || m.location?.state || '',
            join: m.join_date ? new Date(m.join_date).toLocaleString('en-GB') : 'N/A',
            status: m.status || 'Active',
          }));
          setMerchantsData(transformed);
          
          if (merchantsResult.total_pages) {
            setTotalPages(merchantsResult.total_pages);
          } else if (merchantsResult.meta?.totalPages) {
            setTotalPages(merchantsResult.meta.totalPages);
          }
        }

        // Refresh summary stats
        const [t1Result, t2Result, t3Result] = await Promise.all([
          api.systemadmin.getMerchants({ page: 1, type: 't1' }),
          api.systemadmin.getMerchants({ page: 1, type: 't2' }),
          api.systemadmin.getMerchants({ page: 1, type: 't3' }),
        ]);

        const today = new Date().toLocaleDateString('en-GB');
        setSummaryStats({
          t1: {
            count: t1Result?.total || t1Result?.data?.length || t1Result?.count || 0,
            lastUpdate: t1Result?.last_update || t1Result?.lastUpdate || t1Result?.updated_at || today,
          },
          t2: {
            count: t2Result?.total || t2Result?.data?.length || t2Result?.count || 0,
            lastUpdate: t2Result?.last_update || t2Result?.lastUpdate || t2Result?.updated_at || today,
          },
          t3: {
            count: t3Result?.total || t3Result?.data?.length || t3Result?.count || 0,
            lastUpdate: t3Result?.last_update || t3Result?.lastUpdate || t3Result?.updated_at || today,
          },
        });

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
    setHasNextPage(false); // Reset next page check when tier changes
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { 
              label: 'Total T1 Merchants', 
              value: summaryStats.t1.count.toString(), 
              lastUpdate: formatDate(summaryStats.t1.lastUpdate)
            },
            { 
              label: 'Total T2 Merchants', 
              value: summaryStats.t2.count.toString(), 
              lastUpdate: formatDate(summaryStats.t2.lastUpdate)
            },
            { 
              label: 'Total T3 Merchants', 
              value: summaryStats.t3.count.toString(), 
              lastUpdate: formatDate(summaryStats.t3.lastUpdate)
            },
          ].map((stat, i) => <StatCard key={i} {...stat} />)}
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
                    {tier === 'Merchant' ? 'Merchant' : `${tier} Merchant`}
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
              ) : filteredMerchants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No merchants found</p>
                </div>
              ) : (
                <DataTable
                  columns={MERCHANT_COLUMNS}
                  data={filteredMerchants}
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
