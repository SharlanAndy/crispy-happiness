import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2 } from 'lucide-react';
import { StatCard, InfoSection, Card, DataTable, SearchBar, PageHeader, ConfirmDialog } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';

const ITEMS_PER_PAGE = 10;
const NETWORK_SEARCH_KEYS = ['id', 'volume', 'bonus', 'sponsorL1', 'sponsorL2', 'join', 'status', 'referrer'];
const LEVELS = ['level1', 'level2'];

const COLUMNS_LEVEL1 = [
  { key: 'displayId', label: 'Agent ID' },
  { key: 'volume', label: 'Total Volume' },
  { key: 'bonus', label: 'Bonus Contributed', render: (val) => <span className="text-[#166534] font-medium">{val}</span> },
  { key: 'sponsorL1', label: 'Total Sponsor L1' },
  { key: 'sponsorL2', label: 'Total Sponsor L2' },
  { key: 'join', label: 'Join Date' },
  { key: 'status', label: 'Status' },
];

const COLUMNS_LEVEL2 = [
  { key: 'displayId', label: 'Agent ID' },
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
  const [agentStats, setAgentStats] = useState(null);
  const [networkData, setNetworkData] = useState({ level1: [], level2: [] });
  const [loading, setLoading] = useState(true);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [error, setError] = useState(null);

  // Fetch agent details from API
  useEffect(() => {
    if (!id) return;
    
    const abortController = new AbortController();
    
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.systemadmin.getAgentDetails(id);
        
        // Check if request was aborted
        if (abortController.signal.aborted) return;
        
        if (result && result.success && result.data) {
          setAgentDetails(result.data);
        } else {
          setError(result?.message || 'Failed to fetch agent details.');
          setAgentDetails(null);
        }
      } catch (err) {
        // Ignore abort errors
        if (err.name === 'AbortError') return;
        console.error('Error fetching agent details:', err);
        if (!abortController.signal.aborted) {
          setError('Failed to fetch agent details. Please try again.');
          setAgentDetails(null);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAgentDetails();
    
    // Cleanup: abort request if component unmounts or id changes
    return () => {
      abortController.abort();
    };
  }, [id]);

  // Fetch agent statistics
  useEffect(() => {
    if (!id) return;
    
    const abortController = new AbortController();
    
    const fetchAgentStats = async () => {
      try {
        const result = await api.systemadmin.getAgentStats(id);
        
        // Check if request was aborted
        if (abortController.signal.aborted) return;
        
        if (result && result.success && result.data) {
          setAgentStats(result.data);
        } else {
          setAgentStats(null);
        }
      } catch (err) {
        // Ignore abort errors
        if (err.name === 'AbortError') return;
        console.error('Error fetching agent stats:', err);
        if (!abortController.signal.aborted) {
          setAgentStats(null);
        }
      }
    };
    
    fetchAgentStats();
    
    // Cleanup: abort request if component unmounts or id changes
    return () => {
      abortController.abort();
    };
  }, [id]);

  // Fetch agent network data
  useEffect(() => {
    if (!id) return;
    
    const abortController = new AbortController();
    
    const fetchNetwork = async () => {
      try {
        setLoadingNetwork(true);
        const result = await api.systemadmin.getAgentNetwork(id);
        
        // Check if request was aborted
        if (abortController.signal.aborted) return;
        
        if (result && result.success && result.data) {
          // Transform API response to match table format
          // Use the same ID format as agent list: use 'id' field (which matches agent list format)
          const transformNetworkData = (agents, level) => {
            return agents.map(agent => ({
              id: agent.id?.toString() || agent.agent_id || 'N/A', // Use numeric id (same as agent list uses)
              volume: `${(agent.volume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              bonus: `+ ${(agent.bonus_contributed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              sponsorL1: (agent.sponsor_l1_count || 0).toString(),
              sponsorL2: (agent.sponsor_l2_count || 0).toString(),
              join: agent.join_date ? new Date(agent.join_date).toLocaleString('en-GB') : 'N/A',
              status: agent.status ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1) : 'Active',
              referrer: level === 'level2' && agent.referrer_id ? agent.referrer_id.toString() : undefined,
              level: level,
              displayId: agent.agent_id || agent.id?.toString() || 'N/A', // Store agent_id for display purposes
            }));
          };
          
          const transformed = {
            level1: transformNetworkData(result.data.level1 || [], 'level1'),
            level2: transformNetworkData(result.data.level2 || [], 'level2'),
          };
          
          setNetworkData(transformed);
        } else {
          setNetworkData({ level1: [], level2: [] });
        }
      } catch (err) {
        // Ignore abort errors
        if (err.name === 'AbortError') return;
        console.error('Error fetching agent network:', err);
        if (!abortController.signal.aborted) {
          setNetworkData({ level1: [], level2: [] });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingNetwork(false);
        }
      }
    };
    
    fetchNetwork();
    
    // Cleanup: abort request if component unmounts or id changes
    return () => {
      abortController.abort();
    };
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
    () => networkData[activeLevel] || [],
    [networkData, activeLevel]
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
    if (!agentStats) return [];
    
    const totalReferral = agentStats.TotalReferral || agentStats.total_referral || 0;
    const totalVolume = (agentStats.TotalContributedVolume || agentStats.total_contributed_volume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalBonus = (agentStats.TotalBonusReceived || agentStats.total_bonus_received || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Format last update date
    let lastUpdate = 'N/A';
    const lastUpdateValue = agentStats.LastUpdate || agentStats.last_update || agentStats.lastUpdate;
    if (lastUpdateValue) {
      try {
        // Handle format "2025-12-18 10:52:28"
        const date = new Date(lastUpdateValue.replace(' ', 'T'));
        if (!isNaN(date.getTime())) {
          lastUpdate = date.toLocaleDateString('en-GB');
        }
      } catch (e) {
        console.warn('Failed to parse LastUpdate date:', e);
      }
    }
    
    return [
      { label: 'Total Referral', value: totalReferral.toString(), lastUpdate },
      { label: 'Total Contributed Volume', value: `${totalVolume} USDT`, lastUpdate },
      { label: 'Total Bonus Received', value: `${totalBonus} USDT`, lastUpdate },
    ];
  }, [agentStats]);

  const userInfo = useMemo(() => {
    if (!agentDetails) return [];
    
    // Use AgentID from stats if available, otherwise use referral_id from details
    const agentId = agentStats?.AgentID || agentStats?.agentID || agentDetails.referral_id || agentDetails.ReferralID || agentDetails.referralId || agentDetails.id?.toString() || 'N/A';
    const firstName = agentDetails.first_name || agentDetails.FirstName || '';
    const lastName = agentDetails.last_name || agentDetails.LastName || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'N/A';
    const joinDate = agentDetails.created_at || agentDetails.CreatedAt ? new Date(agentDetails.created_at || agentDetails.CreatedAt).toLocaleString('en-GB') : 'N/A';
    const status = agentDetails.status || agentDetails.Status || 'N/A';
    
    return [
      { label: "Agent ID", value: agentId },
      { label: 'Username', value: agentDetails.username || agentDetails.Username || 'N/A' },
      { label: 'Full Name', value: fullName },
      { label: 'Join Date', value: joinDate },
      { label: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1), badge: true },
    ];
  }, [agentDetails, agentStats]);

  const walletAddressInfo = useMemo(() => {
    if (!agentDetails) return [];
    return [
      { label: 'Wallet Address', value: agentDetails.wallet_address || agentDetails.WalletAddress || 'N/A' },
    ];
  }, [agentDetails]);

  const sponsorInfo = useMemo(() => {
    if (!agentDetails) return [];
    return [
      { label: 'Referral ID', value: agentDetails.referral_id || agentDetails.ReferralID || agentDetails.referralId || 'N/A' },
    ];
  }, [agentDetails]);


  // Actions for network list - Level 2 follows user management pattern (navigate to users), Level 1 navigates to agents
  const actions = useMemo(() => {
    if (activeLevel === 'level2') {
      // Level 2: Follow user management pattern - navigate to USER pages
      return [
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
    } else {
      // Level 1: Navigate to agent pages
      return [
        {
          icon: <Eye size={16} />,
          onClick: (row) => navigate(`/system-admin/agents/${row.id}`),
          tooltip: 'View Details',
        },
        {
          icon: <Settings size={16} />,
          onClick: (row) => navigate(`/system-admin/agents/${row.id}/settings`),
          tooltip: 'Settings',
        },
        {
          icon: <Trash2 size={16} />,
          onClick: (row) => setDeleteConfirm({ isOpen: true, item: row }),
          variant: 'danger',
          tooltip: 'Delete',
        },
      ];
    }
  }, [activeLevel, navigate]);

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
            
            {loadingNetwork ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading network data...</p>
              </div>
            ) : (
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
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteConfirm.item)}
        title="Delete Agent"
        message={`Are you sure you want to delete agent ${deleteConfirm.item?.displayId || deleteConfirm.item?.id}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
