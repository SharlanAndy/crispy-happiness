import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, AddAgentModal } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const ITEMS_PER_PAGE = 10;
const AGENT_SEARCH_KEYS = ['id', 'status', 'bonus', 'l1', 'l2', 'join'];

export default function AgentManagement() {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [agentsData, setAgentsData] = useState([]);
  const [agentsMeta, setAgentsMeta] = useState(null);
  const { handleApiResponse, showError } = useToast();

  // Fetch agents data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const agentsResult = await api.systemadmin.getAgents({ page: 1 });

        if (agentsResult && agentsResult.success) {
          const transformed = agentsResult.data.map(a => ({
            id: a.agent_id || a.id || 'N/A',
            bonus: `${(a.bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            l1: (a.level1 || 0).toString(),
            l2: (a.level2 || 0).toString(),
            join: a.join_time ? new Date(a.join_time).toLocaleString('en-GB') : 'N/A',
            status: a.status || 'Active',
            rawBonus: a.bonus || 0, // Store raw bonus value for calculations
            rawStatus: a.status || '' // Store raw status for filtering
          }));
          setAgentsData(transformed);
          // Store meta information from response
          setAgentsMeta(agentsResult.meta || agentsResult);
        } else {
          setAgentsData([]);
          setAgentsMeta(null);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        setAgentsData([]);
        setAgentsMeta(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Apply search and pagination
  const { data: agents, totalPages } = useMemo(
    () => filterAndPaginate(agentsData, searchTerm, AGENT_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [agentsData, searchTerm, currentPage]
  );

  // Calculate stats from API response
  const stats = useMemo(() => {
    // Helper function to get last updated date from API or fallback to today
    const getLastUpdated = () => {
      if (agentsMeta) {
        // Try different possible field names from API
        const lastUpdated = agentsMeta.last_update ||
                            agentsMeta.last_updated_date ||
                            agentsMeta.last_updated || 
                            agentsMeta.updated_at || 
                            agentsMeta.updated_at_date ||
                            agentsMeta.LastUpdated ||
                            agentsMeta.UpdatedAt;
        
        if (lastUpdated) {
          try {
            const date = new Date(lastUpdated);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString('en-GB');
            }
          } catch (e) {
            console.warn('Failed to parse last_update date:', e);
          }
        }
      }
      // Default to today's date
      return new Date().toLocaleDateString('en-GB');
    };

    const lastUpdate = getLastUpdated();

    // Get Total Active Agent from API response
    const totalActiveAgents = agentsMeta?.total_active_agents ?? 0;

    // Get Total Bonus Distributed from API response
    const totalBonusDistributed = agentsMeta?.total_agent_bonus ?? 0;

    return [
      { 
        label: 'Total Active Agent', 
        value: totalActiveAgents.toString(), 
        lastUpdate: lastUpdate 
      },
      { 
        label: 'Total Bonus Distributed', 
        value: `${totalBonusDistributed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, 
        lastUpdate: lastUpdate 
      },
    ];
  }, [agentsMeta]);

  const columns = [
    { key: 'id', label: 'Agent ID' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'l1', label: 'Level 1' },
    { key: 'l2', label: 'Level 2' },
    { key: 'join', label: 'Join Time' },
    { key: 'status', label: 'Status' },
  ];

  const handleDelete = (agent) => {
    console.log('Deleting agent:', agent.id);
    // TODO: api.agent.delete(agent.id);
  };

  const handleCreateAgent = async (agentData) => {
    try {
      // Transform form data to match API expected format
      // API requires: username, email, password, agent_type
      const apiData = {
        username: agentData.username,
        email: agentData.email,
        password: agentData.password,
        agent_type: agentData.agent_type,
      };

      const result = await api.systemadmin.createAgent(apiData);
      
      // Handle API response with toast
      handleApiResponse(result, {
        successMessage: 'Agent created successfully!',
        errorMessage: result?.message || 'Failed to create agent. Please try again.',
      });

      if (result && result.success) {
        // Refresh agent list
        const agentsResult = await api.systemadmin.getAgents({ page: 1 });

        if (agentsResult && agentsResult.success) {
          const transformed = agentsResult.data.map(a => ({
            id: a.agent_id || a.id || 'N/A',
            bonus: `${(a.bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            l1: (a.level1 || 0).toString(),
            l2: (a.level2 || 0).toString(),
            join: a.join_time ? new Date(a.join_time).toLocaleString('en-GB') : 'N/A',
            status: a.status || 'Active',
            rawBonus: a.bonus || 0,
            rawStatus: a.status || ''
          }));
          setAgentsData(transformed);
          // Store full response including total_active_agents, total_agent_bonus, and last_update
          setAgentsMeta(agentsResult.meta || agentsResult);
        }

        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      showError(error?.message || 'Failed to create agent. Please try again.');
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Agent Management"
          description="Overview the Details of Agent Information"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* New Agent Button */}
        <div className="flex">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            New Agent
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Agent List</h2>
              
              {/* Search */}
              <SearchBar
                placeholder="Search Agent..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />

              {/* Data Table */}
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading agents...</p>
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No agents found</p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={agents}
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

      <AddAgentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateAgent}
      />

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
