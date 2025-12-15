import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2 } from 'lucide-react';
import { StatCard, InfoSection, Card, DataTable, SearchBar, PageHeader, ConfirmDialog } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';
import { ALL_NETWORK_DATA } from '../../constant/agentMockData';

const ITEMS_PER_PAGE = 10;
const NETWORK_SEARCH_KEYS = ['id', 'volume', 'bonus', 'sponsorL1', 'sponsorL2', 'join', 'status', 'referrer'];
const LEVELS = ['level1', 'level2'];

const COLUMNS_LEVEL1 = [
  { key: 'id', label: 'Agent ID' },
  { key: 'volume', label: 'Total Volume' },
  { key: 'bonus', label: 'Bonus Contributed', render: (val) => <span className="text-[#166534] font-medium">{val}</span> },
  { key: 'sponsorL1', label: 'Total Sponsor L1' },
  { key: 'sponsorL2', label: 'Total Sponsor L2' },
  { key: 'join', label: 'Join Date' },
  { key: 'status', label: 'Status' },
];

const COLUMNS_LEVEL2 = [
  { key: 'id', label: 'Agent ID' },
  { key: 'referrer', label: 'Referrer' },
  { key: 'volume', label: 'Total Volume' },
  { key: 'bonus', label: 'Bonus Contributed', render: (val) => <span className="text-[#166534] font-medium">{val}</span> },
  { key: 'sponsorL1', label: 'Total Sponsor L1' },
  { key: 'sponsorL2', label: 'Total Sponsor L2' },
  { key: 'join', label: 'Join Date' },
  { key: 'status', label: 'Status' },
];

export default function AgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState('level1');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [agentDetails, setAgentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch agent details from API
  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.systemadmin.getAgentDetails(id);
        
        if (result && result.success && result.data) {
          setAgentDetails(result.data);
        } else {
          setError(result?.message || 'Failed to fetch agent details.');
          setAgentDetails(null);
        }
      } catch (err) {
        console.error('Error fetching agent details:', err);
        setError('Failed to fetch agent details. Please try again.');
        setAgentDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAgentDetails();
    }
  }, [id]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleLevelChange = (level) => {
    setActiveLevel(level);
    setCurrentPage(1);
  };

  // Filter data by level first, then apply search and pagination
  const filteredByLevel = useMemo(
    () => ALL_NETWORK_DATA.filter(item => item.level === activeLevel),
    [activeLevel]
  );

  const { data: paginatedData, totalPages } = useMemo(
    () => filterAndPaginate(filteredByLevel, searchTerm, NETWORK_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [filteredByLevel, searchTerm, currentPage]
  );

  // Select columns based on active level
  const columns = activeLevel === 'level1' ? COLUMNS_LEVEL1 : COLUMNS_LEVEL2;

  // Calculate total bonus for footer
  const totalBonus = useMemo(() => {
    return paginatedData.reduce((sum, item) => {
      const bonusValue = parseFloat(item.bonus.replace(/[^\d.-]/g, '')) || 0;
      return sum + bonusValue;
    }, 0);
  }, [paginatedData]);

  const footerData = useMemo(() => ({
    id: 'Total',
    bonus: <span className="text-[#166534] font-bold">{totalBonus.toLocaleString()} U</span>
  }), [totalBonus]);

  // Transform API data to UI format
  const stats = useMemo(() => {
    if (!agentDetails) return [];
    
    const totalReferral = (agentDetails.TotalSponsorL1 || 0) + (agentDetails.TotalSponsorL2 || 0);
    const totalVolume = (agentDetails.TotalVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalBonus = (agentDetails.BonusContributed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return [
      { label: 'Total Referral', value: totalReferral.toString(), lastUpdate: agentDetails.CreatedAt ? new Date(agentDetails.CreatedAt).toLocaleDateString('en-GB') : 'N/A' },
      { label: 'Total Contributed Volume', value: `${totalVolume} USDT`, lastUpdate: agentDetails.CreatedAt ? new Date(agentDetails.CreatedAt).toLocaleDateString('en-GB') : 'N/A' },
      { label: 'Total Bonus Received', value: `${totalBonus} USDT`, lastUpdate: agentDetails.CreatedAt ? new Date(agentDetails.CreatedAt).toLocaleDateString('en-GB') : 'N/A' },
    ];
  }, [agentDetails]);

  const userInfo = useMemo(() => {
    if (!agentDetails) return [];
    
    const fullName = [agentDetails.FirstName, agentDetails.LastName].filter(Boolean).join(' ') || 'N/A';
    const joinDate = agentDetails.CreatedAt ? new Date(agentDetails.CreatedAt).toLocaleString('en-GB') : 'N/A';
    const status = agentDetails.Status || 'N/A';
    
    return [
      { label: "Agent ID", value: agentDetails.ReferralID || agentDetails.ID?.toString() || 'N/A' },
      { label: 'Username', value: agentDetails.Username || 'N/A' },
      { label: 'Full Name', value: fullName },
      { label: 'Join Date', value: joinDate },
      { label: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1), badge: true },
    ];
  }, [agentDetails]);

  const walletAddressInfo = useMemo(() => {
    if (!agentDetails) return [];
    return [
      { label: 'Wallet Address', value: agentDetails.WalletAddress || 'N/A' },
    ];
  }, [agentDetails]);

  const sponsorInfo = useMemo(() => {
    if (!agentDetails) return [];
    return [
      { label: 'Referral ID', value: agentDetails.ReferralID || 'N/A' },
    ];
  }, [agentDetails]);

  const bonusInfo = useMemo(() => {
    if (!agentDetails) return [];
    const bonusContributed = (agentDetails.BonusContributed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return [
      { label: 'Total Bonus Contributed', value: `${bonusContributed} U` },
      { label: 'Total Sponsor L1', value: (agentDetails.TotalSponsorL1 || 0).toString() },
      { label: 'Total Sponsor L2', value: (agentDetails.TotalSponsorL2 || 0).toString() },
    ];
  }, [agentDetails]);

  const actions = [{
    icon: <Eye size={16} />,
    onClick: (row) => navigate(`/system-admin/agents/${row.id}`),
    tooltip: 'View Details',
  }, {
    icon: <Settings size={16} />,
    onClick: (row) => navigate(`/system-admin/agents/${row.id}/settings`),
    tooltip: 'Settings',
  }, {
    icon: <Trash2 size={16} />,
    onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
    variant: 'danger',
    tooltip: 'Delete',
  }];

  const handleDelete = async (item) => {
    // TODO: Implement delete functionality
    console.log('Delete agent:', item);
    setDeleteConfirm({ isOpen: false, item: null });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agent Details"
          description="Overview the Details of Agent Information"
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agent Details"
          description="Overview the Details of Agent Information"
        />
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Agent Details"
          description="Overview the Details of Agent Information"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoSection title="Agent's Information" items={userInfo} columns={1} />
          <div className="grid grid-rows-1 gap-6">
            <InfoSection title="Wallet Address" items={walletAddressInfo} columns={1} />
            <InfoSection title="Sponsor Information" items={sponsorInfo} columns={1} />
            <InfoSection title="Bonus" items={bonusInfo} columns={1} />
          </div>
        </div>

        <Card title="Network List">
          <div className="flex flex-col gap-6">
            <div className="flex gap-2 bg-[#ECECF0] rounded-full px-2 py-1.5">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={`py-1.5 px-4 text-lg flex-1 rounded-full transition-colors ${
                    activeLevel === level ? 'bg-white text-black' : 'hover:bg-white/50'
                  }`}
                >
                  Level {level === 'level1' ? '1' : '2'}
                </button>
              ))}
            </div>
            <SearchBar placeholder="Search..." value={searchTerm} onChange={handleSearchChange} className="max-w-sm" />
            
            <DataTable 
              columns={columns} 
              data={paginatedData} 
              actions={actions}
              emptyMessage={searchTerm ? `No network members found matching "${searchTerm}"` : 'No network members available'}
              footer={footerData}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }}
            />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteConfirm.item)}
        title="Delete Agent"
        message={`Are you sure you want to delete agent ${deleteConfirm.item?.id}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
