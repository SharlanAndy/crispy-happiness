import { useState } from 'react';
import { Download } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, Button } from '../../components/ui';

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportCSV = () => {
    // Convert transactions to CSV
    const headers = ['Trans. ID', 'Type', 'Merchant Order No.', 'Amount', 'Net Profit', 'Bonus', 'Time', 'Status'];
    const csvData = filteredTransactions.map(t => [
      t.id, t.type, t.merchant, t.amount, t.net, t.bonus, t.time, t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('CSV exported');
  };

  const stats = [
    { label: 'Total Transaction', value: '1,000.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Today Transaction', value: '900.00 USDT', lastUpdate: '17-11-2025' },
  ];

  const allTransactions = [
    { id: 'tx-a1b2c3d4', type: 'Payment', merchant: 'mo12345', amount: '100.00 U', net: '99.00 U', bonus: '0.5 U', time: '01-11-2025 13:00', status: 'Success' },
    { id: 'tx-e5f6g7h8', type: 'Payment', merchant: 'mo12345', amount: '250.00 U', net: '245.00 U', bonus: '5.0 U', time: '02-12-2025 09:30', status: 'Pending' },
    { id: 'tx-i9j0k1l2', type: 'Payment', merchant: 'mo12345', amount: '150.00 U', net: '148.00 U', bonus: '2.0 U', time: '03-01-2026 15:45', status: 'Failed' },
  ];

  // Filter transactions based on search term
  const filteredTransactions = allTransactions.filter(t => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return t.id.toLowerCase().includes(searchLower) ||
      t.type.toLowerCase().includes(searchLower) ||
      t.merchant.toLowerCase().includes(searchLower) ||
      t.status.toLowerCase().includes(searchLower);
  });

  const columns = [
    { key: 'id', label: 'Trans. ID' },
    { key: 'type', label: 'Type' },
    { key: 'merchant', label: 'Merchant Order No.' },
    { key: 'amount', label: 'Amount' },
    { key: 'net', label: 'Net Profit' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Transaction History" description="Overview the Transaction Information" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Transaction List</h2>
          <div className="flex items-center gap-2">
            <SearchBar placeholder="Search Transaction..." value={searchTerm} onChange={setSearchTerm} className="max-w-sm" />
            <Button onClick={handleExportCSV} variant="secondary" icon={<Download size={16} />}>Export to CSV</Button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredTransactions} />
      </div>
    </div>
  );
}
