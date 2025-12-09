import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Check } from 'lucide-react';
import { StatCard, PageHeader, ConfirmDialog, BonusListCard } from '../../components/ui';
import SelectWithIcon from '../../components/ui/SelectWithIcon';
import MonthlyBonusTable from '../../components/ui/MonthlyBonusTable';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';

const ITEMS_PER_PAGE = 10;
const TRANSACTION_SEARCH_KEYS = ['id', 'wallet', 'status'];

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

  // Fetch bonus claims
  useEffect(() => {
    const fetchBonusClaims = async () => {
      try {
        setLoading(true);
        const result = await api.systemadmin.getBonusClaims({ page: 1 });
        if (result && result.success) {
          const transformed = result.data.map(b => ({
            id: `tx-${b.id}`,
            wallet: b.referral_id ? `0x${b.referral_id.slice(0, 5)}....${b.referral_id.slice(-5)}` : 'N/A',
            bonus: `${(b.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            fees: '10.00 USDT', // TODO: Get from API if available
            net: `${(b.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            time: b.claimed_at ? new Date(b.claimed_at).toLocaleString('en-GB') : (b.created_at ? new Date(b.created_at).toLocaleString('en-GB') : 'N/A'),
            status: 'Success',
            bonusTier: b.type || 'System'
          }));
          setBonusClaimsData(transformed);
        } else {
          setBonusClaimsData([]);
        }
      } catch (error) {
        console.error('Failed to fetch bonus claims:', error);
        setBonusClaimsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBonusClaims();
  }, []);

  // Fetch bonus unclaims
  useEffect(() => {
    const fetchBonusUnclaims = async () => {
      try {
        setLoadingUnclaim(true);
        const result = await api.systemadmin.getBonusUnclaims({ page: 1 });
        if (result && result.success) {
          const transformed = result.data.map(b => ({
            id: b.referral_id || `U${b.user_id}`,
            bonus: `${(b.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            update: b.created_at ? new Date(b.created_at).toLocaleString('en-GB') : 'N/A',
            status: 'Pending',
            bonusTier: b.type || 'System'
          }));
          setBonusUnclaimsData(transformed);
        } else {
          setBonusUnclaimsData([]);
        }
      } catch (error) {
        console.error('Failed to fetch bonus unclaims:', error);
        setBonusUnclaimsData([]);
      } finally {
        setLoadingUnclaim(false);
      }
    };
    fetchBonusUnclaims();
  }, []);

  // Fetch monthly bonus
  useEffect(() => {
    const fetchMonthlyBonus = async () => {
      try {
        setLoadingMonthly(true);
        const result = await api.systemadmin.getMonthlyBonus({ month: selectedMonth });
        if (result && result.success) {
          setMonthlyData(result.data);
        } else {
          setMonthlyData(null);
        }
      } catch (error) {
        console.error('Failed to fetch monthly bonus:', error);
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

  // Transform monthly data for display
  const monthlyDataDisplay = monthlyData ? [
    { member: 'System', distributed: `${(monthlyData.total_bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`, claim: `${(monthlyData.total_claimed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`, unclaim: `${(monthlyData.total_unclaimed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U` },
  ] : [];

  // Mock data with month for filtering (fallback)
  const MONTHLY_DATA = {
    '2025-12': [
      { member: 'System', distributed: '12,000.00 U', claim: '6,000.00 U', unclaim: '6,000.00 U' },
      { member: 'Partner', distributed: '11,500.00 U', claim: '11,000.00 U', unclaim: '500.00 U' },
      { member: 'Agent', distributed: '13,000.00 U', claim: '9,000.00 U', unclaim: '4,000.00 U' },
      { member: 'Merchant', distributed: '12,500.00 U', claim: '11,500.00 U', unclaim: '1,000.00 U' },
      { member: 'User', distributed: '11,000.00 U', claim: '11,000.00 U', unclaim: '0.00 U' },
    ],
    '2025-11': [
      { member: 'System', distributed: '10,000.00 U', claim: '5,000.00 U', unclaim: '5,000.00 U' },
      { member: 'Partner', distributed: '10,010.00 U', claim: '10,000.00 U', unclaim: '10.00 U' },
      { member: 'Agent', distributed: '10,000.00 U', claim: '7,000.00 U', unclaim: '3,000.00 U' },
      { member: 'Merchant', distributed: '10,000.00 U', claim: '9,000.00 U', unclaim: '1,000.00 U' },
      { member: 'User', distributed: '10,000.00 U', claim: '10,000.00 U', unclaim: '0.00 U' },
    ],
    '2025-10': [
      { member: 'System', distributed: '8,000.00 U', claim: '4,000.00 U', unclaim: '4,000.00 U' },
      { member: 'Partner', distributed: '9,000.00 U', claim: '8,500.00 U', unclaim: '500.00 U' },
      { member: 'Agent', distributed: '12,000.00 U', claim: '10,000.00 U', unclaim: '2,000.00 U' },
      { member: 'Merchant', distributed: '11,000.00 U', claim: '10,500.00 U', unclaim: '500.00 U' },
      { member: 'User', distributed: '9,500.00 U', claim: '9,500.00 U', unclaim: '0.00 U' },
    ],
    '2025-09': [
      { member: 'System', distributed: '7,500.00 U', claim: '3,500.00 U', unclaim: '4,000.00 U' },
      { member: 'Partner', distributed: '8,200.00 U', claim: '7,800.00 U', unclaim: '400.00 U' },
      { member: 'Agent', distributed: '9,800.00 U', claim: '8,000.00 U', unclaim: '1,800.00 U' },
      { member: 'Merchant', distributed: '10,200.00 U', claim: '9,700.00 U', unclaim: '500.00 U' },
      { member: 'User', distributed: '8,800.00 U', claim: '8,800.00 U', unclaim: '0.00 U' },
    ],
  };

  const monthlyDataFallback = MONTHLY_DATA[selectedMonth] || [];
  const monthlyDataFinal = monthlyDataDisplay.length > 0 ? monthlyDataDisplay : monthlyDataFallback;

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  // Calculate totals
  const calculateTotal = (key) => 
    monthlyDataFinal.reduce((sum, row) => sum + (parseFloat(row[key].replace(/[^\d.-]/g, '')) || 0), 0);

  const totalDistributed = calculateTotal('distributed');
  const totalClaim = calculateTotal('claim');
  const totalUnclaim = calculateTotal('unclaim');

  // Update stats based on selected month
  const stats = [
    { 
      label: 'Total Bonus Distributed', 
      value: `${totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
      lastUpdate: selectedMonthLabel 
    },
    { 
      label: 'Total Bonus Claim', 
      value: `${totalClaim.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
      lastUpdate: selectedMonthLabel 
    },
    { 
      label: 'Total Bonus Unclaim', 
      value: `${totalUnclaim.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
      lastUpdate: selectedMonthLabel 
    },
  ];


  const handleApprove = (item) => {
    console.log('Approving bonus:', item.id);
    // TODO: api.bonus.approve(item.id);
  };

  const BONUS_TIERS = ['System', 'Partner', 'Agent', 'Merchant', 'User'];

  // Filter by bonus tier first, then search and paginate
  const filteredClaimList = bonusClaimsData.filter(item => item.bonusTier === activeBonus);
  const { data: claimList, totalPages } = useMemo(
    () => filterAndPaginate(filteredClaimList, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [filteredClaimList, searchTerm, currentPage]
  );

  const filteredUnclaimList = bonusUnclaimsData.filter(item => item.bonusTier === activeBonusUnclaim);
  const { data: unclaimList, totalPages: totalPagesUnclaim } = useMemo(
    () => filterAndPaginate(filteredUnclaimList, searchTermUnclaim, ['id', 'status'], currentPageUnclaim, ITEMS_PER_PAGE),
    [filteredUnclaimList, searchTermUnclaim, currentPageUnclaim]
  );

  const handleBonusChange = (bonusTier) => {
    setActiveBonus(bonusTier);
    setCurrentPage(1);
  };

  const handleBonusChangeUnclaim = (bonusTier) => {
    setActiveBonusUnclaim(bonusTier);
    setCurrentPageUnclaim(1);
  };

  // Handle search - reset to page 1
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSearchChangeUnclaim = (value) => {
    setSearchTermUnclaim(value);
    setCurrentPageUnclaim(1);
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
    data: claimList,
    actions: [{
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/system-admin/bonus/${row.id}`),
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
                data={monthlyDataFinal}
                totals={{ totalDistributed, totalClaim, totalUnclaim }}
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
