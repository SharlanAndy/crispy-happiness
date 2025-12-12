import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { InfoSection, Card, DataTable, SearchBar, PageHeader } from '@/components/ui';
import { t3Service } from '@/services/t3Service';
import { api, T3SYSTEMADMIN_BASE } from '@/lib/api';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [transactionsData, setTransactionsData] = useState([]);

  // Determine base path from current location
  const basePath = location.pathname.includes('system-admin') ? '/system-admin' : '/t3-admin';
  const isT3Admin = location.pathname.startsWith('/t3-admin');

  // Normalize API response to handle both PascalCase (from API) and snake_case (for backward compatibility)
  const normalizeUserData = (data) => {
    if (!data) return null;
    return {
      id: data.ID || data.id,
      username: data.Username || data.username,
      walletAddress: data.WalletAddress || data.wallet_address,
      status: data.Status || data.status,
      createdAt: data.CreatedAt || data.created_at,
      totalIncomingFunds: data.TotalIncomingFunds ?? data.total_incoming_funds ?? 0,
      totalOutgoingFunds: data.TotalOutgoingFunds ?? data.total_outgoing_funds ?? 0,
      currentUnclaimFunds: data.CurrentUnclaimFunds ?? data.current_unclaim_funds ?? 0,
      totalClaimedFunds: data.TotalClaimedFunds ?? data.total_claimed_funds ?? 0,
    };
  };

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = isT3Admin
          ? await t3Service.getUserDetails(id)
          : await api.request(`${T3SYSTEMADMIN_BASE}/users/${id}`, { method: 'GET' });
        
        if (result.success && result.data) {
          setUserData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id, isT3Admin]);

  // Fetch user transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!id || !userData) return;

      try {
        const result = isT3Admin
          ? await t3Service.getTransactions({ page: currentPage, search: searchTerm })
          : await api.request(`${T3SYSTEMADMIN_BASE}/transactions?page=${currentPage}&search=${encodeURIComponent(searchTerm || '')}`, { method: 'GET' });
        
        if (result.success) {
          // Normalize user data for comparison
          const normalized = normalizeUserData(userData);
          const userId = normalized?.id || parseInt(id.replace('U', ''));
          
          // Filter transactions for this user
          const userTransactions = result.data.filter(t => 
            t.user_id === userId || t.user_id === parseInt(id.replace('U', ''))
          );
          setTransactionsData(userTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactionsData([]);
      }
    };
    
    if (userData) {
      fetchTransactions();
    }
  }, [id, currentPage, searchTerm, userData, isT3Admin]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB');
  };

  const normalizedUserData = normalizeUserData(userData);

  // Format user info from API data
  const userInfo = normalizedUserData ? [
    { label: "User's ID", value: normalizedUserData.id ? `U${normalizedUserData.id}` : id || 'N/A' },
    { label: 'Username', value: normalizedUserData.username || 'N/A' },
    { label: 'Join Date', value: formatDate(normalizedUserData.createdAt) },
    { label: 'Status', value: normalizedUserData.status || 'Active', badge: true },
  ] : [
    { label: "User's ID", value: id || 'A00002' },
    { label: 'Username', value: 'user_0xf39Fd6' },
    { label: 'Join Date', value: '01-11-2025 13:00' },
    { label: 'Status', value: 'Active', badge: true },
  ];

  const walletAddressInfo = normalizedUserData ? [
    { label: 'Wallet Address', value: normalizedUserData.walletAddress || 'N/A' }
  ] : [
    { label: 'Wallet Address', value: '0xF3A1B2C3D4E5F67890123456789ABCDEF012345' }
  ];

  const fundsInfo = normalizedUserData ? [
    { label: 'Current Unclaim Funds', value: `${formatCurrency(normalizedUserData.currentUnclaimFunds)} U` },
    { label: 'Total Claimed Funds', value: `${formatCurrency(normalizedUserData.totalClaimedFunds)} U` },
    { label: 'Total Incoming Funds', value: `${formatCurrency(normalizedUserData.totalIncomingFunds)} U` },
    { label: 'Total Outgoing Funds', value: `${formatCurrency(normalizedUserData.totalOutgoingFunds)} U` },
  ] : [
    { label: 'Current Unclaim Funds', value: '5 U' },
    { label: 'Total Claimed Funds', value: '10 U' },
    { label: 'Total Incoming Funds', value: '0 U' },
    { label: 'Total Outgoing Funds', value: '200 U' },
  ];

  // Transform transactions for display
  const allTransactions = transactionsData.map(t => ({
    id: `tx-${t.id}`,
    type: t.type === 'deposit' || t.type === 'payment' ? 'Incoming' : 'Outgoing',
    total: `${formatCurrency(t.amount)} ${t.currency || 'U'}`,
    fees: `${formatCurrency((t.amount || 0) * 0.02)} ${t.currency || 'U'}`,
    net: `${formatCurrency((t.amount || 0) * 0.98)} ${t.currency || 'U'}`,
    date: formatDate(t.created_at),
    status: t.status === 'completed' ? 'Active' : t.status || 'Active',
  }));

  // Filter transactions based on search term
  const transactions = allTransactions.filter(t => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return t.id.toLowerCase().includes(searchLower) ||
      t.type.toLowerCase().includes(searchLower) ||
      t.status.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Details"
          description="Overview the Details of User Information"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

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

  // Calculate totals for footer
  const footerData = transactions.length > 0 ? {
    total: transactions.reduce((sum, t) => {
      const value = parseFloat(t.total.replace(/[^0-9.]/g, '')) || 0;
      return sum + value;
    }, 0).toFixed(2) + ' U',
    fees: transactions.reduce((sum, t) => {
      const value = parseFloat(t.fees.replace(/[^0-9.]/g, '')) || 0;
      return sum + value;
    }, 0).toFixed(2) + ' U',
    net: transactions.reduce((sum, t) => {
      const value = parseFloat(t.net.replace(/[^0-9.]/g, '')) || 0;
      return sum + value;
    }, 0).toFixed(2) + ' U',
  } : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Details"
        description="Overview the Details of User Information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoSection title="User's Information" items={userInfo} columns={1} />
        <div className="grid grid-rows-1 gap-6">
          <InfoSection title="Wallet Address Information" items={walletAddressInfo} columns={1} />
          <InfoSection title="Funds Information" items={fundsInfo} columns={1} />
        </div>
      </div>

      <Card title="Transaction History">
        <div className="mb-4">
          <SearchBar placeholder="Search Transaction..." value={searchTerm} onChange={setSearchTerm} className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={transactions} actions={actions} footer={footerData} />
      </Card>
    </div>
  );
}
