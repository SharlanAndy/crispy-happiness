import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, InfoSection, Card, DataTable, SearchBar, PageHeader, ProfitChart, TabButtons, Modal, Button, FormField } from '../../components/ui';
import { PasswordInput, TextInput } from '../../components/form';

import { filterAndPaginate } from '../../lib/pagination';
import {
  PROFIT_CHART_DATA,
  MERCHANT_STATS,
  MERCHANT_BUSINESS_INFO,
  MERCHANT_ADDRESS_INFO,
  MERCHANT_WALLET_INFO,
  MERCHANT_REFERRAL_INFO,
  MERCHANT_FEES_INFO,
  MERCHANT_CURRENCY_INFO,
  MOCK_TRANSACTIONS,
  TRANSACTION_COLUMNS,
  PROFIT_TABS,
} from '../../constant/mockData';

const ITEMS_PER_PAGE = 10;
const TRANSACTION_SEARCH_KEYS = ['id', 'type', 'status'];

export default function MerchantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('This Month');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal and form states for T3 Admin
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('0x123456789abcdef');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Check if accessed from T3 Admin (will hide Referral, Fees, Currencies sections)
  const isT3Admin = location.pathname.startsWith('/t3-admin');

  // Filter merchant info - remove email and password for T3 Admin
  const merchantInfo = isT3Admin 
    ? MERCHANT_BUSINESS_INFO.filter(item => item.label !== 'Email' && item.label !== 'Password' && item.label !== 'Status' )
    : MERCHANT_BUSINESS_INFO;

  // Email and Password info for T3 Admin
  const credentialsInfo = MERCHANT_BUSINESS_INFO.filter(item => item.label === 'Email' || item.label === 'Password');

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Get profit chart data for active tab
  const chartData = PROFIT_CHART_DATA[activeTab];

  // Filter and paginate transactions
  const { data: transactions, totalPages } = useMemo(
    () => filterAndPaginate(MOCK_TRANSACTIONS, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [searchTerm, currentPage]
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {MERCHANT_STATS.map((stat, idx) => (
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
                  {MERCHANT_WALLET_INFO.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-base text-black font-medium">{walletAddress}</span>
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
                items={MERCHANT_ADDRESS_INFO}
                columns={1}
              />
            </div>
          </div>
        ) : (
          // System Admin Layout (original)
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <InfoSection
              title="Merchant's Information"
              items={MERCHANT_BUSINESS_INFO}
              columns={1}
            />
            <div className="grid grid-cols-1 gap-6">
              <InfoSection
                title="Business Address"
                items={MERCHANT_ADDRESS_INFO}
                columns={1}
              />
              <InfoSection
                title="Wallet"
                items={MERCHANT_WALLET_INFO}
                columns={1}
              />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <InfoSection
                title="Referral"
                items={MERCHANT_REFERRAL_INFO}
                columns={1}
              />
              <InfoSection
                title="Fees"
                items={MERCHANT_FEES_INFO}
                columns={1}
              />
              <InfoSection
                title="Currencies"
                items={MERCHANT_CURRENCY_INFO}
                columns={1}
              />
            </div>
          </div>
        )}

        {/* Profit Chart Section */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-black">Total Profit</h3>
            <TabButtons 
              tabs={PROFIT_TABS} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
          </div>
          
          <div className="h-[300px]">
            <ProfitChart data={chartData} />
          </div>
        </div>

        {/* Transaction List Section */}
        <Card title="Transaction List">
          <div className="flex flex-col gap-5">
            <SearchBar
              placeholder="Search Transaction..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
            <DataTable
              columns={TRANSACTION_COLUMNS}
              data={transactions}
              actions={transactionActions}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }}
            />
          </div>
        </Card>
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
