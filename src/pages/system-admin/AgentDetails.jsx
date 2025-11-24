import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { StatCard, InfoSection, Card, DataTable, SearchBar, Button, Tabs } from '../../components/ui';

export default function AgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState('level1');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Total Referral', value: '23', lastUpdate: '17-11-2025' },
    { label: 'Total Contributed Volume', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Total Bonus Received', value: '100.00 USDT', lastUpdate: '17-11-2025' },
  ];

  const userInfo = [
    { label: "User's ID", value: 'A00002' },
    { label: 'Wallet Address', value: <span className="font-mono text-xs">0xF3A1B2C3D4E5F67890123456789ABCDEF012345</span> },
    { label: 'Status', value: 'Active' },
    { label: 'Sponsor By', value: 'A00001' },
    { label: 'Join Date', value: '01-11-2025 13:00' },
  ];

  const bonusInfo = [
    { label: 'Current Unclaim Bonus', value: '100 U' },
    { label: 'Total Claimed Bonus', value: '1000 U' },
    { label: 'Total Bonus Received', value: '1100 U' },
  ];

  const allNetworkData = [
    { id: 'U000001', volume: '35,000.00 U', bonus: '+ 352.00 U', sponsor: '100', join: '01-11-2025 13:00', status: 'Active' },
    { id: 'U000002', volume: '42,500.00 U', bonus: '+ 480.00 U', sponsor: '120', join: '05-12-2025 14:30', status: 'Active' },
    { id: 'U000003', volume: '29,750.00 U', bonus: '+ 310.00 U', sponsor: '90', join: '15-10-2025 09:15', status: 'Active' },
  ];

  // Filter network data based on search term
  const networkData = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return allNetworkData;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return allNetworkData.filter(item => {
      return (
        item.id.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        item.volume.toLowerCase().includes(searchLower) ||
        item.bonus.toLowerCase().includes(searchLower) ||
        item.sponsor.toLowerCase().includes(searchLower) ||
        item.join.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  const columns = [
    { key: 'id', label: 'U. ID' },
    { key: 'volume', label: 'Total Volume' },
    { key: 'bonus', label: 'Bonus Contributed', render: (val) => <span className="text-green-600 font-medium">{val}</span> },
    { key: 'sponsor', label: 'Total Sponsor' },
    { key: 'join', label: 'Join Date' },
    { key: 'status', label: 'Status' },
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => console.log('View', row.id),
      tooltip: 'View',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={<ArrowLeft size={20} />} onClick={() => navigate(-1)} />
        <div>
          <h1 className="text-2xl font-bold">Agent Details</h1>
          <p className="text-muted-foreground">Overview the Details of Agent Information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoSection title="User's Information" items={userInfo} columns={1} />
        <InfoSection title="Bonus" items={bonusInfo} columns={1} />
      </div>

      <Card title="Network List">
        <div className="mb-4 flex gap-4">
          <Tabs
            tabs={[
              { id: 'level1', label: 'Level 1' },
              { id: 'level2', label: 'Level 2' },
            ]}
            activeTab={activeLevel}
            onTabChange={setActiveLevel}
            variant="pills"
          />
          <SearchBar placeholder="Search..." value={searchTerm} onChange={setSearchTerm} className="max-w-sm" />
        </div>
        <DataTable 
          columns={columns} 
          data={networkData} 
          actions={actions}
          emptyMessage={searchTerm ? `No network members found matching "${searchTerm}"` : 'No network members available'}
        />
      </Card>
    </div>
  );
}
