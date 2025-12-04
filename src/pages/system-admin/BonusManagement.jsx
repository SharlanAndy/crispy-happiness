import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Check } from 'lucide-react';
import { StatCard, PageHeader, ConfirmDialog, BonusListCard } from '../../components/ui';
import SelectWithIcon from '../../components/ui/SelectWithIcon';
import MonthlyBonusTable from '../../components/ui/MonthlyBonusTable';
import { filterAndPaginate } from '../../lib/pagination';

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

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, currentPageUnclaim]);

  // Mock data with month for filtering
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

  const monthlyData = MONTHLY_DATA[selectedMonth] || [];

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  // Calculate totals
  const calculateTotal = (key) => 
    monthlyData.reduce((sum, row) => sum + (parseFloat(row[key].replace(/[^\d.-]/g, '')) || 0), 0);

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

  const bonusClaimList = [
    { id: 'tx-a1b2c3d4', wallet: '0xF3A....12345', bonus: '10,000.00 U', fees: '10.00 USDT', net: '10.00 USDT', time: '01-11-2025 13:00', status: 'Success', bonusTier: 'System' },
    { id: 'tx-e5f6g7h8', wallet: '0xF4B....67890', bonus: '15,500.00 U', fees: '20.00 USDT', net: '20.00 USDT', time: '02-12-2025 14:30', status: 'Success', bonusTier: 'Partner' },
    { id: 'tx-i9j0k1l2', wallet: '0xF5C....13579', bonus: '25,750.00 U', fees: '50.00 USDT', net: '50.00 USDT', time: '03-13-2025 15:45', status: 'Success', bonusTier: 'Agent' },
    { id: 'tx-m3n4o5p6', wallet: '0xF6D....24680', bonus: '8,200.00 U', fees: '8.00 USDT', net: '8.00 USDT', time: '04-14-2025 10:15', status: 'Success', bonusTier: 'System' },
    { id: 'tx-q7r8s9t0', wallet: '0xF7E....97531', bonus: '12,300.00 U', fees: '12.00 USDT', net: '12.00 USDT', time: '05-15-2025 16:20', status: 'Success', bonusTier: 'Merchant' },
    { id: 'tx-u1v2w3x4', wallet: '0xF8F....86420', bonus: '5,600.00 U', fees: '5.00 USDT', net: '5.00 USDT', time: '06-16-2025 11:30', status: 'Success', bonusTier: 'User' },
  ];

  const bonusUnclaimList = [
    { id: 'U000001', bonus: '10,000.00 U', update: '01-11-2025 13:00', status: 'Pending', bonusTier: 'System' },
    { id: 'U000002', bonus: '15,500.00 U', update: '02-11-2025 14:30', status: 'Pending', bonusTier: 'Partner' },
    { id: 'U000003', bonus: '7,250.00 U', update: '03-11-2025 09:45', status: 'Pending', bonusTier: 'Agent' },
    { id: 'U000004', bonus: '9,800.00 U', update: '04-12-2025 15:20', status: 'Pending', bonusTier: 'System' },
    { id: 'U000005', bonus: '13,400.00 U', update: '05-13-2025 12:10', status: 'Pending', bonusTier: 'Merchant' },
    { id: 'U000006', bonus: '6,700.00 U', update: '06-14-2025 09:30', status: 'Pending', bonusTier: 'User' },
  ];

  const handleApprove = (item) => {
    console.log('Approving bonus:', item.id);
    // TODO: api.bonus.approve(item.id);
  };

  const BONUS_TIERS = ['System', 'Partner', 'Agent', 'Merchant', 'User'];

  // Filter by bonus tier first, then search and paginate
  const filteredClaimList = bonusClaimList.filter(item => item.bonusTier === activeBonus);
  const { data: claimList, totalPages } = useMemo(
    () => filterAndPaginate(filteredClaimList, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [filteredClaimList, searchTerm, currentPage]
  );

  const filteredUnclaimList = bonusUnclaimList.filter(item => item.bonusTier === activeBonusUnclaim);
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
            <MonthlyBonusTable
              data={monthlyData}
              totals={{ totalDistributed, totalClaim, totalUnclaim }}
              emptyMessage={`No data available for ${selectedMonthLabel}`}
            />
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
