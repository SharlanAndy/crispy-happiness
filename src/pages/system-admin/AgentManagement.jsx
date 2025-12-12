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
  const [dashboardData, setDashboardData] = useState(null);
  const { handleApiResponse, showError } = useToast();

  // Fetch agents data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const [agentsResult, dashboardResult] = await Promise.all([
          api.systemadmin.getAgents({ page: 1 }), // Fetch all, filter client-side
          api.systemadmin.getDashboard()
        ]);

        if (agentsResult && agentsResult.success) {
          const transformed = agentsResult.data.map(a => ({
            id: a.id || 'N/A',
            bonus: `${(a.bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            l1: (a.level1 || 0).toString(),
            l2: (a.level2 || 0).toString(),
            join: a.join_time ? new Date(a.join_time).toLocaleString('en-GB') : 'N/A',
            status: a.status || 'Active'
          }));
          setAgentsData(transformed);
        } else {
          setAgentsData([]);
        }

        if (dashboardResult && dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        setAgentsData([]);
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

  const stats = dashboardData ? [
    { label: 'Total Active Agent', value: dashboardData.total_active_agents?.toString() || '0', lastUpdate: new Date().toLocaleDateString('en-GB') },
    { label: 'Total Bonus Distributed', value: `${(dashboardData.total_bonus_distributed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
  ] : [
    { label: 'Total Active Agent', value: '0', lastUpdate: 'No data' },
    { label: 'Total Bonus Distributed', value: '0.00 USDT', lastUpdate: 'No data' },
  ];

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
      const apiData = {
        email: agentData.email,
        password: agentData.password,
        wallet_address: agentData.walletAddress,
        sponsor_id: agentData.sponsorBy || '',
        initial_bonus: agentData.initialBonus ? parseFloat(agentData.initialBonus) : 0,
        bonus_currency: agentData.currency || 'USDT',
      };

      const result = await api.systemadmin.createAgent(apiData);
      
      // Handle API response with toast
      handleApiResponse(result, {
        successMessage: 'Agent created successfully!',
        errorMessage: result?.message || 'Failed to create agent. Please try again.',
      });

      if (result && result.success) {
        // Refresh agent list
        const [agentsResult, dashboardResult] = await Promise.all([
          api.systemadmin.getAgents({ page: 1 }),
          api.systemadmin.getDashboard()
        ]);

        if (agentsResult && agentsResult.success) {
          const transformed = agentsResult.data.map(a => ({
            id: a.id || 'N/A',
            bonus: `${(a.bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            l1: (a.level1 || 0).toString(),
            l2: (a.level2 || 0).toString(),
            join: a.join_time ? new Date(a.join_time).toLocaleString('en-GB') : 'N/A',
            status: a.status || 'Active'
          }));
          setAgentsData(transformed);
        }

        if (dashboardResult && dashboardResult.success) {
          setDashboardData(dashboardResult.data);
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
