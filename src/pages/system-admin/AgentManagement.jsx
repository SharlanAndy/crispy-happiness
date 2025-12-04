import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, AddAgentModal } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';

const ITEMS_PER_PAGE = 10;
const AGENT_SEARCH_KEYS = ['id', 'status', 'bonus', 'l1', 'l2', 'join'];

export default function AgentManagement() {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const allAgents = [
    { id: 'A000001', bonus: '10,000 U', l1: '10', l2: '200', join: '01-11-2025 13:00', status: 'Active' },
    { id: 'A000002', bonus: '15,000 U', l1: '15', l2: '300', join: '01-12-2025 14:00', status: 'Active' },
    { id: 'A000003', bonus: '8,000 U', l1: '8', l2: '150', join: '01-01-2026 09:00', status: 'Active' },
    { id: 'A000004', bonus: '20,000 U', l1: '5', l2: '400', join: '01-03-2026 10:00', status: 'Active' },
    { id: 'A000005', bonus: '12,500 U', l1: '12', l2: '250', join: '01-04-2026 11:00', status: 'Active' },
  ];

  // Apply search and pagination
  const { data: agents, totalPages } = useMemo(
    () => filterAndPaginate(allAgents, searchTerm, AGENT_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [searchTerm, currentPage]
  );

  const stats = [
    { label: 'Total Active Agent', value: '23', lastUpdate: '17-11-2025' },
    { label: 'Total Bonus Distributed', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
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

  const handleCreateAgent = (agentData) => {
    // TODO: Implement create agent logic
    console.log('Creating new agent...', agentData);
    // After creation, you might want to refresh the agent list
    // or navigate to the new agent's detail page
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
