import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { InfoSection, Card, DataTable, SearchBar, PageHeader } from '../../components/ui';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Determine base path from current location
  const basePath = window.location.pathname.includes('system-admin') ? '/system-admin' : '/t3-admin';

  const userInfo = [
    { label: "User's ID", value: 'A00002' },
    { label: "Password", value: '********' },
    { label: 'Join Date', value: '01-11-2025 13:00' },
    { label: 'Status', value: 'Active', badge: true },
  ];

  const sponsorInfo = [
    { label: 'Sponsor By', value: 'A00001' }
  ];

  const walletAddressInfo = [
    { label: 'Wallet Address', value: '0xF3A1B2C3D4E5F67890123456789ABCDEF012345' }
  ];

  const fundsInfo = [
    { label: 'Current Unclaim Funds', value: '100 U' },
    { label: 'Total Claimed Funds', value: '1000 U' },
    { label: 'Total Incoming Funds', value: '1100 U' },
  ];

  const allTransactions = [
    { id: 'tx-a1b2c3d4', type: 'Incoming', total: '500.00 U', fees: '10.00 U', net: '490.00 U', date: '01-11-2025 13:00', status: 'Active' },
    { id: 'tx-b2c3d4e5', type: 'Outgoing', total: '500.00 U', fees: '10.00 U', net: '490.00 U', date: '01-11-2025 13:00', status: 'Active' },
    { id: 'tx-c3d4e5f6', type: 'Incoming', total: '500.00 U', fees: '10.00 U', net: '490.00 U', date: '01-11-2025 13:00', status: 'Active' },
  ];

  // Filter transactions based on search term
  const transactions = allTransactions.filter(t => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return t.id.toLowerCase().includes(searchLower) ||
      t.type.toLowerCase().includes(searchLower) ||
      t.status.toLowerCase().includes(searchLower);
  });

  const columns = [
    { key: 'id', label: 'Trans. ID' },
    { key: 'type', label: 'Type' },
    { key: 'total', label: 'Total Volume' },
    { key: 'fees', label: 'Fees' },
    { key: 'net', label: 'Net Volume' },
    { key: 'date', label: 'Trans Date' },
    { key: 'status', label: 'Status' },
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`${basePath}/transactions/${row.id}`),
      tooltip: 'View',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Details"
        description="Overview the Details of User Information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoSection title="User's Information" items={userInfo} columns={1} />
        <div className="grid grid-rows-1 gap-6">
          <InfoSection title="Sponsor Information" items={sponsorInfo} columns={1} />
          <InfoSection title="Wallet Address Information" items={walletAddressInfo} columns={1} />
          <InfoSection title="Funds Information" items={fundsInfo} columns={1} />
        </div>
      </div>

      <Card title="Transaction History">
        <div className="mb-4">
          <SearchBar placeholder="Search Transaction..." value={searchTerm} onChange={setSearchTerm} className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={transactions} actions={actions} />
      </Card>
    </div>
  );
}
