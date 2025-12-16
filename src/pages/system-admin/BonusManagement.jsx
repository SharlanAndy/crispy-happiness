import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Check } from 'lucide-react';
import { StatCard, PageHeader, ConfirmDialog, BonusListCard } from '../../components/ui';
import SelectWithIcon from '../../components/ui/SelectWithIcon';
import MonthlyBonusTable from '../../components/ui/MonthlyBonusTable';
import { api } from '@/lib/api';

export default function BonusManagement() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageUnclaim, setCurrentPageUnclaim] = useState(1);
  const [approveConfirm, setApproveConfirm] = useState({ isOpen: false, item: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermUnclaim, setSearchTermUnclaim] = useState('');
  const [activeBonus, setActiveBonus] = useState('System');
  const [activeBonusUnclaim, setActiveBonusUnclaim] = useState('System');
  const [loading, setLoading] = useState(true);
  const [loadingUnclaim, setLoadingUnclaim] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [bonusClaimsData, setBonusClaimsData] = useState([]);
  const [bonusUnclaimsData, setBonusUnclaimsData] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [hasNextPageClaim, setHasNextPageClaim] = useState(false);
  const [hasNextPageUnclaim, setHasNextPageUnclaim] = useState(false);
  const [paginationMetaClaim, setPaginationMetaClaim] = useState({ limit: 20, page: 1, total: null });
  const [paginationMetaUnclaim, setPaginationMetaUnclaim] = useState({ limit: 20, page: 1, total: null });

  // Generate month options for the past 12 months
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = getMonthOptions();
  
  // Detect current month and set as default (first option in dropdown)
  const currentMonthValue = monthOptions[0]?.value || '2025-12';
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  
  const selectedMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || monthOptions[0]?.label;

  // Map API type to bonus tier filter
  const mapTypeToTier = (type) => {
    if (!type) return 'System';
    const typeLower = type.toLowerCase();
    // Map common API types to filter tiers
    if (typeLower === 'referral' || typeLower === 'user') return 'User';
    if (typeLower === 'partner') return 'Partner';
    if (typeLower === 'agent') return 'Agent';
    if (typeLower === 'merchant') return 'Merchant';
    if (typeLower === 'system') return 'System';
    // Default: if it doesn't match, return as-is (capitalized)
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Fetch bonus claims
  useEffect(() => {
    const fetchBonusClaims = async () => {
      try {
        setLoading(true);
        const params = { page: currentPage };
        // Add search parameter with lowercase tab value (system, partner, agent, merchant, user)
        // Default to 'system' if activeBonus is not set
        params.search = (activeBonus || 'System').toLowerCase();
        const result = await api.systemadmin.getBonusClaims(params);
        if (result && result.success) {
          const dataArray = result.data || [];
          const limit = result.limit || 20;
          const page = result.page || currentPage;
          const total = result.total || null;
          
          setPaginationMetaClaim({ limit, page, total });
          
          const transformed = dataArray.map(b => ({
            id: b.id, // Store numeric ID for API calls
            displayId: `tx-${b.id}`, // Display ID with tx- prefix
            wallet: b.username || `U${b.user_id}` || 'N/A',
            bonus: `${(b.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${b.currency || 'USDT'}`,
            fees: '0.00 USDT', // Fees not in API response, will be shown in details
            net: `${(b.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${b.currency || 'USDT'}`,
            time: b.claimed_at ? new Date(b.claimed_at).toLocaleString('en-GB') : (b.created_at ? new Date(b.created_at).toLocaleString('en-GB') : 'N/A'),
            status: b.status === 'claimed' ? 'Success' : b.status || 'Pending',
            bonusTier: mapTypeToTier(b.type),
            rawData: b // Keep raw data for reference
          }));
          setBonusClaimsData(transformed);

          // Determine if there's a next page
          if (total !== null) {
            setHasNextPageClaim(page * limit < total);
          } else if (dataArray.length < limit) {
            setHasNextPageClaim(false);
          } else if (dataArray.length === limit && page === 1) {
            // Check page 2
            const checkNextPage = async () => {
              try {
                const nextPageParams = { page: 2, search: params.search };
                const nextPageResult = await api.systemadmin.getBonusClaims(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPageClaim(nextPageData.length > 0);
                } else {
                  setHasNextPageClaim(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageClaim(false);
              }
            };
            checkNextPage();
          } else if (dataArray.length === limit && page > 1) {
            // Check next page
            const checkNextPage = async () => {
              try {
                const nextPageParams = { page: page + 1, search: params.search };
                const nextPageResult = await api.systemadmin.getBonusClaims(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPageClaim(nextPageData.length > 0);
                } else {
                  setHasNextPageClaim(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageClaim(false);
              }
            };
            checkNextPage();
          }
        } else {
          setBonusClaimsData([]);
          setHasNextPageClaim(false);
        }
      } catch (error) {
        console.error('Failed to fetch bonus claims:', error);
        setBonusClaimsData([]);
        setHasNextPageClaim(false);
      } finally {
        setLoading(false);
      }
    };
    fetchBonusClaims();
  }, [currentPage, activeBonus]);

  // Fetch bonus unclaims
  useEffect(() => {
    const fetchBonusUnclaims = async () => {
      try {
        setLoadingUnclaim(true);
        const params = { page: currentPageUnclaim };
        // Add search parameter with lowercase tab value (system, partner, agent, merchant, user)
        // Default to 'system' if activeBonusUnclaim is not set
        params.search = (activeBonusUnclaim || 'System').toLowerCase();
        
        const result = await api.systemadmin.getBonusUnclaims(params);
        
        if (result && result.success && result.data && Array.isArray(result.data)) {
          const dataArray = result.data || [];
          const limit = result.limit || 20;
          const page = result.page || currentPageUnclaim;
          const total = result.total || null;
          
          setPaginationMetaUnclaim({ limit, page, total });
          
          const transformed = dataArray.map(b => ({
            id: b.user_id ? `U${b.user_id}` : b.referral_id || 'N/A',
            bonus: `${(b.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${b.currency || 'USDT'}`,
            update: b.created_at ? new Date(b.created_at).toLocaleString('en-GB') : 'N/A',
            status: 'Pending',
            bonusTier: mapTypeToTier(b.type),
            rawData: b // Keep raw data for reference
          }));
          setBonusUnclaimsData(transformed);

          // Determine if there's a next page
          if (total !== null) {
            setHasNextPageUnclaim(page * limit < total);
          } else if (dataArray.length < limit) {
            setHasNextPageUnclaim(false);
          } else if (dataArray.length === limit && page === 1) {
            // Check page 2
            const checkNextPage = async () => {
              try {
                const nextPageParams = { page: 2, search: params.search };
                const nextPageResult = await api.systemadmin.getBonusUnclaims(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPageUnclaim(nextPageData.length > 0);
                } else {
                  setHasNextPageUnclaim(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageUnclaim(false);
              }
            };
            checkNextPage();
          } else if (dataArray.length === limit && page > 1) {
            // Check next page
            const checkNextPage = async () => {
              try {
                const nextPageParams = { page: page + 1, search: params.search };
                const nextPageResult = await api.systemadmin.getBonusUnclaims(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPageUnclaim(nextPageData.length > 0);
                } else {
                  setHasNextPageUnclaim(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPageUnclaim(false);
              }
            };
            checkNextPage();
          }
        } else {
          setBonusUnclaimsData([]);
          setHasNextPageUnclaim(false);
        }
      } catch (error) {
        console.error('Failed to fetch bonus unclaims:', error);
        setBonusUnclaimsData([]);
        setHasNextPageUnclaim(false);
      } finally {
        setLoadingUnclaim(false);
      }
    };
    fetchBonusUnclaims();
  }, [currentPageUnclaim, activeBonusUnclaim]);

  // Fetch monthly bonus
  useEffect(() => {
    const fetchMonthlyBonus = async () => {
      try {
        setLoadingMonthly(true);
        console.log('Fetching monthly bonus for month:', selectedMonth);
        const result = await api.systemadmin.getMonthlyBonus({ month: selectedMonth });
        console.log('Monthly bonus API response:', result);
        console.log('API endpoint called: /api/t3systemadmin/bonus/monthly?month=' + selectedMonth);
        
        if (result && result.success) {
          console.log('Monthly bonus data:', result.data);
          setMonthlyData(result.data);
        } else {
          console.warn('Monthly bonus API returned unsuccessful or no data:', result);
          setMonthlyData(null);
        }
      } catch (error) {
        console.error('Failed to fetch monthly bonus:', error);
        console.error('Error details:', error.message, error.stack);
        setMonthlyData(null);
      } finally {
        setLoadingMonthly(false);
      }
    };
    fetchMonthlyBonus();
  }, [selectedMonth]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, currentPageUnclaim]);

  // Transform monthly data for display from API response
  // API returns: { member_types: [{ member_type, total_distributed, total_claimed, total_unclaimed }], totals: {...} }
  const monthlyDataDisplay = useMemo(() => {
    if (!monthlyData || !monthlyData.member_types || !Array.isArray(monthlyData.member_types)) {
      return [];
    }

    // Define the order we want to display members
    const memberOrder = ['System', 'Partner', 'Agent', 'Merchant', 'User'];
    
    // Create a map for quick lookup
    const memberMap = new Map();
    monthlyData.member_types.forEach(member => {
      memberMap.set(member.member_type, member);
    });

    // Transform and order according to memberOrder
    return memberOrder
      .filter(memberType => memberMap.has(memberType)) // Only include members that exist in API response
      .map(memberType => {
        const member = memberMap.get(memberType);
        return {
          member: member.member_type,
          distributed: `${(member.total_distributed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
          claim: `${(member.total_claimed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
          unclaim: `${(member.total_unclaimed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
        };
      });
  }, [monthlyData]);

  // Get totals from API response
  const totals = useMemo(() => {
    if (!monthlyData || !monthlyData.totals) {
      return { totalDistributed: 0, totalClaim: 0, totalUnclaim: 0 };
    }
    return {
      totalDistributed: monthlyData.totals.total_distributed || 0,
      totalClaim: monthlyData.totals.total_claimed || 0,
      totalUnclaim: monthlyData.totals.total_unclaimed || 0,
    };
  }, [monthlyData]);

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  // Update stats based on selected month - use totals from API response
  const stats = [
    { 
      label: 'Total Bonus Distributed', 
      value: `${totals.totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
      lastUpdate: selectedMonthLabel 
    },
    { 
      label: 'Total Bonus Claim', 
      value: `${totals.totalClaim.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
      lastUpdate: selectedMonthLabel 
    },
    { 
      label: 'Total Bonus Unclaim', 
      value: `${totals.totalUnclaim.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
      lastUpdate: selectedMonthLabel 
    },
  ];


  const handleApprove = (item) => {
    console.log('Approving bonus:', item.id);
    // TODO: api.bonus.approve(item.id);
  };

  const BONUS_TIERS = ['System', 'Partner', 'Agent', 'Merchant', 'User'];

  // Calculate total pages for claims
  const totalPages = useMemo(() => {
    if (paginationMetaClaim.total !== null && paginationMetaClaim.total !== undefined) {
      return Math.ceil(paginationMetaClaim.total / paginationMetaClaim.limit);
    }
    if (bonusClaimsData.length < paginationMetaClaim.limit) {
      return paginationMetaClaim.page;
    }
    if (bonusClaimsData.length === paginationMetaClaim.limit) {
      return hasNextPageClaim ? paginationMetaClaim.page + 1 : paginationMetaClaim.page;
    }
    return 1;
  }, [paginationMetaClaim, bonusClaimsData.length, hasNextPageClaim]);

  // Apply client-side search only (API handles pagination)
  const claimList = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return bonusClaimsData.map(item => ({
        ...item,
        id: item.displayId || `tx-${item.id}`
      }));
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return bonusClaimsData.filter(item => {
      return (
        item.displayId?.toLowerCase().includes(searchLower) ||
        item.wallet?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower)
      );
    }).map(item => ({
      ...item,
      id: item.displayId || `tx-${item.id}`
    }));
  }, [bonusClaimsData, searchTerm]);

  // Calculate total pages for unclaims
  const totalPagesUnclaim = useMemo(() => {
    if (paginationMetaUnclaim.total !== null && paginationMetaUnclaim.total !== undefined) {
      return Math.ceil(paginationMetaUnclaim.total / paginationMetaUnclaim.limit);
    }
    if (bonusUnclaimsData.length < paginationMetaUnclaim.limit) {
      return paginationMetaUnclaim.page;
    }
    if (bonusUnclaimsData.length === paginationMetaUnclaim.limit) {
      return hasNextPageUnclaim ? paginationMetaUnclaim.page + 1 : paginationMetaUnclaim.page;
    }
    return 1;
  }, [paginationMetaUnclaim, bonusUnclaimsData.length, hasNextPageUnclaim]);

  // Apply client-side search only (API handles pagination)
  const unclaimList = useMemo(() => {
    if (!searchTermUnclaim || !searchTermUnclaim.trim()) {
      return bonusUnclaimsData;
    }
    const searchLower = searchTermUnclaim.toLowerCase().trim();
    return bonusUnclaimsData.filter(item => {
      return (
        item.id?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [bonusUnclaimsData, searchTermUnclaim]);

  const handleBonusChange = (bonusTier) => {
    setActiveBonus(bonusTier);
    setCurrentPage(1);
    setSearchTerm(''); // Clear search when changing tabs
    setHasNextPageClaim(false); // Reset next page check
  };

  const handleBonusChangeUnclaim = (bonusTier) => {
    setActiveBonusUnclaim(bonusTier);
    setCurrentPageUnclaim(1);
    setSearchTermUnclaim(''); // Clear search when changing tabs
    setHasNextPageUnclaim(false); // Reset next page check
  };

  // Handle search - reset to page 1
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setHasNextPageClaim(false); // Reset next page check when search changes
  };

  const handleSearchChangeUnclaim = (value) => {
    setSearchTermUnclaim(value);
    setCurrentPageUnclaim(1);
    setHasNextPageUnclaim(false); // Reset next page check when search changes
  };

  const bonusLists = [{
    title: 'Bonus Claim List',
    searchPlaceholder: 'Search Transaction...',
    searchValue: searchTerm,
    onSearchChange: handleSearchChange,
    activeTier: activeBonus,
    onTierChange: handleBonusChange,
    columns: [
      { key: 'id', label: 'Trans. ID' },
      { key: 'wallet', label: 'Wallet ID' },
      { key: 'bonus', label: 'Bonus' },
      { key: 'fees', label: 'Fees' },
      { key: 'net', label: 'Net Bonus' },
      { key: 'time', label: 'Time' },
      { key: 'status', label: 'Status' },
    ],
    data: claimList.map(item => ({
      ...item,
      id: item.displayId || `tx-${item.id}` // Use displayId for table display
    })),
    actions: [{
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/system-admin/bonus/${row.id || row.rawData?.id}`),
      tooltip: 'View Details',
    }],
    pagination: {
      currentPage,
      totalPages,
      onPageChange: setCurrentPage,
    },
  }, {
    title: 'Bonus Unclaim List',
    searchPlaceholder: 'Search User...',
    searchValue: searchTermUnclaim,
    onSearchChange: handleSearchChangeUnclaim,
    activeTier: activeBonusUnclaim,
    onTierChange: handleBonusChangeUnclaim,
    columns: [
      { key: 'id', label: 'U.ID' },
      { key: 'bonus', label: 'Bonus' },
      { key: 'update', label: 'Last Update' },
      { key: 'status', label: 'Status' },
    ],
    data: unclaimList,
    actions: [{
      icon: <Check size={16} />,
      onClick: (row) => setApproveConfirm({ isOpen: true, item: row }),
      tooltip: 'Approve',
    }],
    pagination: {
      currentPage: currentPageUnclaim,
      totalPages: totalPagesUnclaim,
      onPageChange: setCurrentPageUnclaim,
    },
  }];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Bonus Management"
          description="Overview the Details of Bonus Information"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Monthly Bonus Info */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Monthly Bonus Information</h2>
            <SelectWithIcon
              value={selectedMonth}
              onChange={handleMonthChange}
              options={monthOptions}
              icon={<Calendar size={24} />}
            />
            {loadingMonthly ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading monthly bonus data...</p>
              </div>
            ) : (
              <MonthlyBonusTable
                data={monthlyDataDisplay}
                totals={totals}
                emptyMessage={`No data available for ${selectedMonthLabel}`}
              />
            )}
          </div>
        </div>

        {/* Bonus Lists */}
        {bonusLists.map((list, idx) => (
          <BonusListCard
            key={idx}
            title={list.title}
            searchPlaceholder={list.searchPlaceholder}
            searchValue={list.searchValue}
            onSearchChange={list.onSearchChange}
            tiers={BONUS_TIERS}
            activeTier={list.activeTier}
            onTierChange={list.onTierChange}
            columns={list.columns}
            data={list.data}
            actions={list.actions}
            pagination={list.pagination}
          />
        ))}
      </div>
      <ConfirmDialog
        isOpen={approveConfirm.isOpen}
        onClose={() => setApproveConfirm({ isOpen: false, item: null })}
        onConfirm={() => handleApprove(approveConfirm.item)}
        title="Approve Bonus"
        message={`Are you sure you want to approve bonus ${approveConfirm.item?.id}?`}
        confirmText="Approve"
        variant="info"
      />
    </>
  );
}
