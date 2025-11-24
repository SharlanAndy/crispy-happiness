import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, Modal, FormField } from '../../components/ui';

export default function AgentManagement() {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const allAgents = [
    { id: 'T1234567890', bonus: '10,000 U', l1: '10', l2: '200', join: '01-11-2025 13:00', status: 'Active' },
    { id: 'T1234567891', bonus: '15,000 U', l1: '15', l2: '300', join: '01-12-2025 14:00', status: 'Active' },
    { id: 'T1234567892', bonus: '8,000 U', l1: '8', l2: '150', join: '01-01-2026 09:00', status: 'Active' },
    { id: 'T1234567893', bonus: '20,000 U', l1: '5', l2: '400', join: '01-03-2026 10:00', status: 'Active' },
    { id: 'T1234567894', bonus: '12,500 U', l1: '12', l2: '250', join: '01-04-2026 11:00', status: 'Active' },
  ];

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter agents based on search term - search across multiple fields
  const agents = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return allAgents;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return allAgents.filter(a => {
      return (
        a.id.toLowerCase().includes(searchLower) ||
        a.status.toLowerCase().includes(searchLower) ||
        a.bonus.toLowerCase().includes(searchLower) ||
        a.l1.toLowerCase().includes(searchLower) ||
        a.l2.toLowerCase().includes(searchLower) ||
        a.join.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

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

  const handleCreateAgent = () => {
    // TODO: Implement create agent logic
    console.log('Creating new agent...');
    setShowAddModal(false);
    // After creation, you might want to refresh the agent list
    // or navigate to the new agent's detail page
  };

  const actions = [
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Management"
        description="Overview the Details of Agent Information"
        action={
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus size={20} />
            New Agent
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Agent List</h2>
          <SearchBar
            placeholder="Search Agent..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-sm"
          />
        </div>

        <DataTable
          columns={columns}
          data={agents}
          actions={actions}
          pagination={{
            currentPage,
            totalPages: Math.max(1, Math.ceil(agents.length / 10)),
            onPageChange: setCurrentPage,
          }}
          emptyMessage={searchTerm ? `No agents found matching "${searchTerm}"` : 'No agents available'}
        />
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

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Agent"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border rounded-lg hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAgent}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Create Agent
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Agent's Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Agent's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Agent ID">
                <input 
                  type="text" 
                  placeholder="Auto-generated or enter manually" 
                  className="w-full px-3 py-2 rounded-lg border bg-background" 
                />
              </FormField>
              <FormField label="Email Address">
                <input 
                  type="email" 
                  placeholder="agent@example.com" 
                  className="w-full px-3 py-2 rounded-lg border bg-background" 
                />
              </FormField>
              <FormField label="Full Name">
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  className="w-full px-3 py-2 rounded-lg border bg-background" 
                />
              </FormField>
              <FormField label="Phone Number">
                <input 
                  type="tel" 
                  placeholder="+60 12-345-6789" 
                  className="w-full px-3 py-2 rounded-lg border bg-background" 
                />
              </FormField>
              <FormField label="Status">
                <select className="w-full px-3 py-2 rounded-lg border bg-background">
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </FormField>
              <FormField label="Wallet Address">
                <input 
                  type="text" 
                  placeholder="0x..." 
                  className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-sm" 
                />
              </FormField>
            </div>
          </section>

          {/* Initial Bonus Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Initial Bonus Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Initial Bonus Amount">
                <input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border bg-background" 
                />
              </FormField>
              <FormField label="Currency">
                <select className="w-full px-3 py-2 rounded-lg border bg-background">
                  <option>USDT</option>
                  <option>USDC</option>
                  <option>ETH</option>
                </select>
              </FormField>
            </div>
          </section>

          {/* Additional Notes */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
            <FormField label="Notes">
              <textarea 
                rows={4}
                placeholder="Any additional notes or information about this agent..." 
                className="w-full px-3 py-2 rounded-lg border bg-background" 
              />
            </FormField>
          </section>
        </div>
      </Modal>
    </div>
  );
}
