import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Check, X } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, Tabs, ConfirmDialog } from '../../components/ui';

export default function WithdrawalManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, action: null, item: null });

  const stats = [
    { label: 'Current Withdraw Application', value: '10', lastUpdate: '17-11-2025' },
    { label: 'Total Withdraw Approve', value: '100', lastUpdate: '17-11-2025' },
    { label: 'Total Withdraw Amount', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
  ];

  const allPendingWithdrawals = [
    { id: 'ap123455551', merchant: 'mo12345', amount: '10,000.00 U', wallet: '0xF3A....12345', time: '01-11-2025 13:00', ref: 'Test123', status: 'Pending' },
    { id: 'ap123455552', merchant: 'mo12346', amount: '15,500.75 U', wallet: '0xF3A....12346', time: '02-11-2025 14:00', ref: 'Test456', status: 'Pending' },
    { id: 'ap123455553', merchant: 'mo12347', amount: '8,250.00 U', wallet: '0xF3A....12347', time: '03-11-2025 15:00', ref: 'Test789', status: 'Pending' },
  ];

  const allHistoryWithdrawals = [
    { id: 'ap123455551', amount: '10,000.00 U', wallet: '0xF3A....12345', time: '01-11-2025 13:00', status: 'Approve' },
    { id: 'ap123455552', amount: '5,500.00 U', wallet: '0xA1B....67890', time: '01-12-2025 09:30', status: 'Approve' },
    { id: 'ap123455553', amount: '15,750.00 U', wallet: '0xE2C....23456', time: '01-13-2025 11:15', status: 'Reject' },
  ];

  // Filter based on search term
  const pendingWithdrawals = allPendingWithdrawals.filter(w => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return w.id.toLowerCase().includes(searchLower) ||
      w.merchant?.toLowerCase().includes(searchLower) ||
      w.wallet.toLowerCase().includes(searchLower) ||
      w.ref?.toLowerCase().includes(searchLower);
  });

  const historyWithdrawals = allHistoryWithdrawals.filter(w => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return w.id.toLowerCase().includes(searchLower) ||
      w.wallet.toLowerCase().includes(searchLower) ||
      w.status.toLowerCase().includes(searchLower);
  });

  const handleApprove = (item) => {
    console.log('Approving withdrawal:', item.id);
    // TODO: api.withdrawal.approve(item.id);
  };

  const handleReject = (item) => {
    console.log('Rejecting withdrawal:', item.id);
    // TODO: api.withdrawal.reject(item.id, { reason: 'Invalid wallet' });
  };

  const pendingColumns = [
    { key: 'id', label: 'Application ID' },
    { key: 'merchant', label: 'Merchant Order No.' },
    { key: 'amount', label: 'Amount' },
    { key: 'wallet', label: 'Wallet Address' },
    { key: 'time', label: 'Application Time' },
    { key: 'ref', label: 'Reference' },
    { key: 'status', label: 'Status' },
  ];

  const historyColumns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'wallet', label: 'Wallet Address' },
    { key: 'time', label: 'Approve Time' },
    { key: 'status', label: 'Status' },
  ];

  const pendingActions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/t3-admin/withdrawals/${row.id}`),
      tooltip: 'View Details',
    },
    {
      icon: <Check size={16} />,
      onClick: (row) => setActionConfirm({ isOpen: true, action: 'approve', item: row }),
      tooltip: 'Approve',
      variant: 'success',
    },
    {
      icon: <X size={16} />,
      onClick: (row) => setActionConfirm({ isOpen: true, action: 'reject', item: row }),
      tooltip: 'Reject',
      variant: 'danger',
    },
  ];

  const historyActions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/t3-admin/withdrawals/${row.id}`),
      tooltip: 'View Details',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawal Management"
        description="Overview the Details of Withdraw Information"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Tabs
          tabs={[
            { id: 'pending', label: 'Withdrawal Applications List' },
            { id: 'history', label: 'Withdrawal History' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6 border-b">
          <SearchBar
            placeholder="Search Agent..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-sm"
          />
        </div>

        <DataTable
          columns={activeTab === 'pending' ? pendingColumns : historyColumns}
          data={activeTab === 'pending' ? pendingWithdrawals : historyWithdrawals}
          actions={activeTab === 'pending' ? pendingActions : historyActions}
        />
      </div>

      <ConfirmDialog
        isOpen={actionConfirm.isOpen}
        onClose={() => setActionConfirm({ isOpen: false, action: null, item: null })}
        onConfirm={() => {
          if (actionConfirm.action === 'approve') {
            handleApprove(actionConfirm.item);
          } else {
            handleReject(actionConfirm.item);
          }
        }}
        title={actionConfirm.action === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
        message={`Are you sure you want to ${actionConfirm.action} withdrawal ${actionConfirm.item?.id}?`}
        confirmText={actionConfirm.action === 'approve' ? 'Approve' : 'Reject'}
        variant={actionConfirm.action === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
}
