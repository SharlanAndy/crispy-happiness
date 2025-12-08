import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, InfoSection, Card, DataTable, SearchBar, PageHeader, ProfitChart, TabButtons, Modal, Button, FormField } from '../../components/ui';
import { PasswordInput, TextInput } from '../../components/form';

import { filterAndPaginate } from '../../lib/pagination';
import { t3Service } from '../../services/t3Service';
import { api } from '../../lib/api';

const ITEMS_PER_PAGE = 10;
const TRANSACTION_SEARCH_KEYS = ['id', 'type', 'status'];

export default function MerchantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('This Month');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [merchantData, setMerchantData] = useState(null);
  const [transactionsData, setTransactionsData] = useState([]);
  
  // Modal and form states for T3 Admin
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Check if accessed from T3 Admin (will hide Referral, Fees, Currencies sections)
  const isT3Admin = location.pathname.startsWith('/t3-admin');

  // Fetch merchant details
  useEffect(() => {
    const fetchMerchantDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = isT3Admin 
          ? await t3Service.getMerchantDetails(id)
          : await api.request(`/systemadmin/merchants/${id}`, { method: 'GET' });
        
        if (result.success && result.data) {
          setMerchantData(result.data);
          setWalletAddress(result.data.wallet_address || '');
        }
      } catch (error) {
        console.error('Failed to fetch merchant details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchantDetails();
  }, [id, isT3Admin]);

  // Fetch merchant transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!id) return;

      try {
        // Fetch transactions for this merchant
        const result = isT3Admin
          ? await t3Service.getTransactions({ page: currentPage, search: searchTerm })
          : await api.request(`/systemadmin/transactions?page=${currentPage}&search=${encodeURIComponent(searchTerm || '')}`, { method: 'GET' });
        
        if (result.success) {
          // Filter transactions for this merchant/user
          const merchantTransactions = result.data.filter(t => 
            t.user_id === merchantData?.user_id || t.merchant_id === parseInt(id)
          );
          setTransactionsData(merchantTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactionsData([]);
      }
    };
    
    if (merchantData) {
      fetchTransactions();
    }
  }, [id, currentPage, searchTerm, merchantData, isT3Admin]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Format merchant info from API data
  const merchantInfo = merchantData ? [
    { label: 'Business Name', value: merchantData.business_name || merchantData.name || 'N/A' },
    { label: 'SSM Number', value: merchantData.business_registration || merchantData.ssm_number || 'N/A' },
    ...(isT3Admin ? [] : [
      { label: 'Email', value: merchantData.email || 'N/A' },
      { label: 'Password', value: '••••••••' },
      { label: 'Status', value: merchantData.status || 'Active', badge: true }
    ])
  ] : [];

  // Email and Password info for T3 Admin
  const credentialsInfo = merchantData ? [
    { label: 'Email', value: merchantData.email || 'N/A' },
    { label: 'Password', value: '••••••••' }
  ] : [];

  // Format address info
  const addressInfo = merchantData?.location ? [
    { label: 'Address Line 1', value: merchantData.location || 'N/A' },
    { label: 'City', value: merchantData.city || 'N/A' },
    { label: 'State', value: merchantData.state || 'N/A' },
    { label: 'Country', value: merchantData.country || 'N/A' },
    { label: 'Postcode', value: merchantData.postcode || 'N/A' }
  ] : [];

  // Format wallet info
  const walletInfo = [{ label: 'Wallet Address', value: walletAddress || merchantData?.wallet_address || 'N/A' }];

  // Stats from merchant data
  const stats = merchantData ? [
    { label: 'Total Transaction', value: `${(merchantData.total_transaction || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
    { label: 'Total Net Profit', value: `${(merchantData.total_net_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
    { label: 'Total Fees Contributed', value: `${(merchantData.total_fees_contributed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') }
  ] : [];

  // Get profit chart data for active tab (using empty data for now - can be enhanced with real API)
  const chartData = []; // TODO: Add profit chart API endpoint

  // Transform transactions for display
  const transformedTransactions = transactionsData.map(t => ({
    id: `T${String(t.id || '').padStart(6, '0')}`,
    type: t.type || 'Payment',
    status: t.status === 'completed' ? 'Success' : t.status === 'pending' ? 'Pending' : t.status === 'failed' ? 'Failed' : t.status || 'Success',
    rawData: t
  }));

  // Filter and paginate transactions
  const { data: transactions, totalPages } = useMemo(
    () => filterAndPaginate(transformedTransactions, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [transformedTransactions, searchTerm, currentPage]
  );

  // Handle search - reset to page 1
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Transaction table actions
  const transactionActions = useMemo(() => [
    {
      icon: <Eye size={16} />,
      onClick: (row) => {
        const basePath = isT3Admin ? '/t3-admin' : '/system-admin';
        navigate(`${basePath}/transactions/${row.id}`);
      },
      tooltip: 'View',
    },
  ], [navigate, isT3Admin]);

  // Handle wallet address update
  const handleWalletUpdate = () => {
    // TODO: Add API call to update wallet address
    console.log('Updating wallet address:', walletAddress);
    setShowWalletModal(false);
  };

  // Handle password update
  const handlePasswordUpdate = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Passwords do not match');
      return;
    }
    // TODO: Add API call to update password
    console.log('Updating password');
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  // Reusable card with edit button for T3 Admin
  const InfoCard = ({ title, onEdit, children }) => (
    <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Merchant Details"
          description="Overview the Details of Merchant Information"
        />

        {/* Stats Section */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading merchant details...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
              ))}
            </div>

        {/* Info Sections */}
        {isT3Admin ? (
          // T3 Admin Layout
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 gap-6">
              <InfoSection
                title="Business's Information"
                items={merchantInfo}
                columns={1}
              />
              <InfoCard title="Wallet Information" onEdit={() => setShowWalletModal(true)}>
                <div className="space-y-3">
                  {walletInfo.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-base text-black font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </InfoCard>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <InfoCard title="Email & Password" onEdit={() => setShowPasswordModal(true)}>
                <div className="space-y-3">
                  {credentialsInfo.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-base text-black font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </InfoCard>
              <InfoSection
                title="Business Address"
                items={addressInfo}
                columns={1}
              />
            </div>
          </div>
        ) : (
          // System Admin Layout (original) - still uses mock data for system admin
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <InfoSection
              title="Merchant's Information"
              items={merchantInfo.length > 0 ? merchantInfo : []}
              columns={1}
            />
            <div className="grid grid-cols-1 gap-6">
              <InfoSection
                title="Business Address"
                items={addressInfo.length > 0 ? addressInfo : []}
                columns={1}
              />
              <InfoSection
                title="Wallet"
                items={walletInfo}
                columns={1}
              />
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Referral, Fees, Currencies sections - only for system admin, not T3 admin */}
            </div>
          </div>
        )}

        {/* Profit Chart Section - Hidden for T3 Admin or show empty if no data */}
        {!isT3Admin && (
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-black">Total Profit</h3>
              <TabButtons 
                tabs={[{ id: 'This Month', label: 'This Month' }]} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
            </div>
            
            <div className="h-[300px]">
              <ProfitChart data={chartData} />
            </div>
          </div>
        )}

        {/* Transaction List Section */}
        <Card title="Transaction List">
          <div className="flex flex-col gap-5">
            <SearchBar
              placeholder="Search Transaction..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: 'id', label: 'Trans. ID' },
                  { key: 'type', label: 'Type' },
                  { key: 'status', label: 'Status' }
                ]}
                data={transactions}
                actions={transactionActions}
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: setCurrentPage,
                }}
              />
            )}
          </div>
        </Card>
          </>
        )}
      </div>
      {/* Wallet Address Edit Modal */}
      <Modal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        title="Edit Wallet Address"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowWalletModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleWalletUpdate}>
              Save Changes
            </Button>
          </>
        }
      >
        <FormField label="Wallet Address">
          <TextInput
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter wallet address"
          />
        </FormField>
      </Modal>

      {/* Password Edit Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate}>
              Update Password
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <FormField label="Current Password">
            <PasswordInput
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              placeholder="Enter current password"
            />
          </FormField>

          <FormField label="New Password">
            <PasswordInput
              value={passwordForm.new}
              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              placeholder="Enter new password"
            />
          </FormField>

          <FormField label="Confirm Password">
            <PasswordInput
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Confirm new password"
            />
          </FormField>
        </div>
      </Modal>
    </>
  );
}
