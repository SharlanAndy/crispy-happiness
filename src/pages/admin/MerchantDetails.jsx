import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { StatCard, InfoSection, DataTable, PageHeader, ProfitChart, TabButtons, Modal, Button, FormField } from '@/components/ui';
import { PasswordInput, TextInput } from '@/components/form';

import { t3Service } from '@/services/t3Service';
import { api, T3SYSTEMADMIN_BASE } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';


export default function MerchantDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { showError, handleApiResponse } = useToast();
  const [activeTab, setActiveTab] = useState('Today');
  const [loading, setLoading] = useState(true);
  const [merchantData, setMerchantData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [t3Admins, setT3Admins] = useState([]);
  const [regularTransactions, setRegularTransactions] = useState([]);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [regularTransactionsPage, setRegularTransactionsPage] = useState(1);
  const [paymentTransactionsPage, setPaymentTransactionsPage] = useState(1);
  
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
          : await api.systemadmin.getMerchantDetails(id);
        
        if (result.success && result.data) {
          setMerchantData(result.data);
          // Handle both PascalCase (from API) and snake_case (for backward compatibility)
          setWalletAddress(result.data.WalletAddress || result.data.wallet_address || '');
          
          // Extract transactions and payment_transactions from merchant data (for system admin only)
          if (!isT3Admin) {
            // Regular transactions from transactions array
            const regularTrans = result.data.transactions || result.data.Transactions || [];
            setRegularTransactions(Array.isArray(regularTrans) ? regularTrans : []);
            
            // Payment transactions from payment_transactions.data
            const paymentTransData = result.data.payment_transactions || result.data.PaymentTransactions || {};
            const paymentTrans = paymentTransData.data || paymentTransData.Data || [];
            setPaymentTransactions(Array.isArray(paymentTrans) ? paymentTrans : []);
            
            // Extract T3 admins from merchant data (t3_admins field)
            const t3AdminsData = result.data.t3_admins || result.data.t3Admins || [];
            if (Array.isArray(t3AdminsData)) {
              setT3Admins(t3AdminsData);
            } else {
              setT3Admins([]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch merchant details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchantDetails();
  }, [id, isT3Admin]);


  // Scroll to top when transaction pages change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [regularTransactionsPage, paymentTransactionsPage]);

  // Format merchant info from API data
  // Handle both PascalCase (from API) and snake_case (for backward compatibility)
  const merchantInfo = merchantData ? [
    { label: 'Business Name', value: merchantData.BusinessName || merchantData.business_name || merchantData.Name || merchantData.name || 'N/A' },
    { label: 'SSM Number', value: merchantData.SSMNumber || merchantData.business_registration || merchantData.ssm_number || 'N/A' },
    ...(isT3Admin ? [] : [
      { label: 'Email', value: merchantData.Email || merchantData.email || 'N/A' },
      { label: 'Password', value: '••••••••' },
      { label: 'Status', value: merchantData.Status || merchantData.status || 'Active', badge: true }
    ])
  ] : [];

  // Email and Password info for T3 Admin
  const credentialsInfo = merchantData ? [
    { label: 'Email', value: merchantData.Email || merchantData.email || 'N/A' },
    { label: 'Password', value: '••••••••' }
  ] : [];

  // Format address info
  // Handle both PascalCase (from API) and snake_case (for backward compatibility)
  const addressInfo = merchantData ? [
    { label: 'Address Line 1', value: merchantData.AddressLine1 || merchantData.addressLine1 || merchantData.location || 'N/A' },
    { label: 'Address Line 2', value: merchantData.AddressLine2 || merchantData.addressLine2 || '' },
    { label: 'City', value: merchantData.City || merchantData.city || 'N/A' },
    { label: 'State', value: merchantData.State || merchantData.state || 'N/A' },
    { label: 'Country', value: merchantData.Country || merchantData.country || 'N/A' },
    { label: 'Postcode', value: merchantData.Postcode || merchantData.postcode || 'N/A' }
  ].filter(item => item.value && item.value !== '') : [];

  // Format wallet info
  // Handle both PascalCase (from API) and snake_case (for backward compatibility)
  const walletInfo = [{ label: 'Wallet Address', value: walletAddress || merchantData?.WalletAddress || merchantData?.wallet_address || 'N/A' }];

  // Stats from merchant data
  // Handle both PascalCase (from API) and snake_case (for backward compatibility)
  const stats = merchantData ? [
    { label: 'Total Transaction', value: `${(merchantData.TotalTransaction || merchantData.total_transaction || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
    { label: 'Total Net Profit', value: `${(merchantData.TotalNetProfit || merchantData.total_net_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
    { label: 'Total Fees Contributed', value: `${(merchantData.TotalFeesContributed || merchantData.total_fees_contributed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') }
  ] : [];

  // Extract profit chart data from merchant data (profit_breakdown)
  useEffect(() => {
    if (!merchantData || isT3Admin) {
      setChartData([]);
      setLoadingChart(false);
      return;
    }

    try {
      setLoadingChart(true);
      
      // Map tab to profit_breakdown field
      const periodMap = {
        'Today': 'daily',
        'This Week': 'weekly',
        'This Month': 'monthly',
        'This Year': 'yearly',
      };
      const periodKey = periodMap[activeTab] || 'monthly';
      
      // Extract profit_breakdown from merchant data
      const profitBreakdown = merchantData.profit_breakdown || merchantData.ProfitBreakdown || {};
      const profitValue = profitBreakdown[periodKey] ?? profitBreakdown[periodKey.charAt(0).toUpperCase() + periodKey.slice(1)] ?? 0;
      
      // Transform to chart format (single data point for the selected period)
      // Chart expects array of { time, profit } objects
      // Always show data even if value is 0
      const transformedData = [{
        time: activeTab,
        profit: Number(profitValue) || 0
      }];
      
      setChartData(transformedData);
    } catch (error) {
      console.error('Failed to extract profit chart data:', error);
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [merchantData, activeTab, isT3Admin]);

  // T3 admins are now extracted from merchant details response (t3_admins field)
  // No separate API call needed - data comes from api/t3systemadmin/merchants/{id}
  
  // Paginate transaction lists
  const TRANSACTIONS_PER_PAGE = 10;
  
  // Paginate regular transactions
  const paginatedRegularTransactions = useMemo(() => {
    const startIndex = (regularTransactionsPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    return regularTransactions.slice(startIndex, endIndex);
  }, [regularTransactions, regularTransactionsPage]);
  
  const regularTransactionsTotalPages = useMemo(() => {
    return Math.ceil(regularTransactions.length / TRANSACTIONS_PER_PAGE);
  }, [regularTransactions.length]);
  
  // Paginate payment transactions
  const paginatedPaymentTransactions = useMemo(() => {
    const startIndex = (paymentTransactionsPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    return paymentTransactions.slice(startIndex, endIndex);
  }, [paymentTransactions, paymentTransactionsPage]);
  
  const paymentTransactionsTotalPages = useMemo(() => {
    return Math.ceil(paymentTransactions.length / TRANSACTIONS_PER_PAGE);
  }, [paymentTransactions.length]);

  // Handle T3 admin status toggle
  const handleToggleT3AdminStatus = useCallback(async (admin) => {
    const currentStatus = admin.status?.toLowerCase() || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // Optimistic update
      setT3Admins(prev => prev.map(acc => acc.id === admin.id ? { ...acc, status: newStatus } : acc));

      const result = await api.systemadmin.updateT3AdminStatus(admin.id, { status: newStatus });
      handleApiResponse(result, {
        successMessage: result?.message || 'T3 admin status updated successfully',
        errorMessage: result?.message || 'Failed to update T3 admin status. Please try again.',
        onSuccess: async () => {
          // Refresh merchant details to get updated T3 admins list
          if (id) {
            try {
              const fetchResult = await api.systemadmin.getMerchantDetails(id);
              if (fetchResult && fetchResult.success && fetchResult.data) {
                const t3AdminsData = fetchResult.data.t3_admins || fetchResult.data.t3Admins || [];
                if (Array.isArray(t3AdminsData)) {
                  setT3Admins(t3AdminsData);
                }
              }
            } catch (error) {
              console.error('Failed to refresh T3 admins:', error);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to update T3 admin status:', error);
      showError('Failed to update T3 admin status. Please try again.');
      // Revert optimistic update on error
      setT3Admins(prev => prev.map(acc => acc.id === admin.id ? { ...acc, status: currentStatus } : acc));
    }
  }, [id, handleApiResponse, showError]);


  // Handle wallet address update
  const handleWalletUpdate = () => {
    // TODO: Add API call to update wallet address
    console.log('Updating wallet address:', walletAddress);
    setShowWalletModal(false);
  };

  // Handle password update
  const handlePasswordUpdate = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      showError('Passwords do not match');
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                tabs={['Today', 'This Week', 'This Month', 'This Year']} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
            </div>
            
            <div className="h-[300px]">
              {loadingChart ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Loading chart data...
                </div>
              ) : (
                <ProfitChart data={chartData} />
              )}
            </div>
          </div>
        )}

        {/* Transaction List Section - System Admin Only */}
        {!isT3Admin && (
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5">
            <h3 className="text-2xl font-semibold text-black mb-4">Transaction List</h3>
            {regularTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions available
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'description', label: 'Description' },
                  { key: 'type', label: 'Type' },
                  { key: 'created_at', label: 'Created At' },
                ]}
                data={paginatedRegularTransactions.map(t => ({
                  id: t.id || 'N/A',
                  amount: `${(t.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  description: t.description || 'N/A',
                  type: t.type || 'N/A',
                  created_at: t.created_at ? new Date(t.created_at).toLocaleString('en-GB') : 'N/A',
                }))}
                actions={[]}
                pagination={
                  regularTransactionsTotalPages > 1 ? {
                    currentPage: regularTransactionsPage,
                    totalPages: regularTransactionsTotalPages,
                    onPageChange: (page) => {
                      setRegularTransactionsPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    },
                  } : undefined
                }
              />
            )}
          </div>
        )}

        {/* Payment Transaction List Section - System Admin Only */}
        {!isT3Admin && (
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5">
            <h3 className="text-2xl font-semibold text-black mb-4">Payment Transaction List</h3>
            {paymentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payment transactions available
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'converted_amount', label: 'Converted Amount' },
                  { key: 'currency', label: 'Currency' },
                  { key: 'currency_rate', label: 'Currency Rate' },
                  { key: 'original_amount', label: 'Original Amount' },
                  { key: 'original_currency', label: 'Original Currency' },
                  { key: 'markup_fees', label: 'Markup Fees' },
                  { key: 'platform_fees', label: 'Platform Fees' },
                  { key: 'processing_fees', label: 'Processing Fees' },
                  { key: 'total_payable', label: 'Total Payable' },
                  { key: 'status', label: 'Status' },
                  { key: 'user_id', label: 'User ID' },
                  { key: 'username', label: 'Username' },
                  { key: 'wallet_address', label: 'Wallet Address' },
                  { key: 'created_at', label: 'Created At' },
                ]}
                data={paginatedPaymentTransactions.map(t => ({
                  id: t.id || 'N/A',
                  amount: t.amount != null ? `${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                  converted_amount: t.converted_amount != null ? `${Number(t.converted_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                  currency: t.currency || 'N/A',
                  currency_rate: t.currency_rate != null ? Number(t.currency_rate).toLocaleString('en-US') : 'N/A',
                  original_amount: t.original_amount != null ? `${Number(t.original_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                  original_currency: t.original_currency || 'N/A',
                  markup_fees: t.markup_fees != null ? `${Number(t.markup_fees).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                  platform_fees: t.platform_fees != null ? `${Number(t.platform_fees).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                  processing_fees: t.processing_fees != null ? `${Number(t.processing_fees).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                  total_payable: t.total_payable != null ? `${Number(t.total_payable).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                  status: t.status || 'N/A',
                  user_id: t.user_id || 'N/A',
                  username: t.username || 'N/A',
                  wallet_address: t.wallet_address || 'N/A',
                  created_at: t.created_at ? new Date(t.created_at).toLocaleString('en-GB') : 'N/A',
                }))}
                actions={[]}
                pagination={
                  paymentTransactionsTotalPages > 1 ? {
                    currentPage: paymentTransactionsPage,
                    totalPages: paymentTransactionsTotalPages,
                    onPageChange: (page) => {
                      setPaymentTransactionsPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    },
                  } : undefined
                }
              />
            )}
          </div>
        )}

        {/* T3 Admin List Section - Only show for T3 merchants */}
        {!isT3Admin && (() => {
          // Check if merchant category is T3
          const category = merchantData?.category || merchantData?.Category || merchantData?.user_type || merchantData?.UserType || '';
          const isT3Merchant = category.toString().toLowerCase() === 't3';
          
          // Only render if category is T3
          if (!isT3Merchant) return null;
          
          return (
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5">
              <h3 className="text-2xl font-semibold text-black mb-4">T3 Admin List</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading T3 admins...
              </div>
            ) : t3Admins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No T3 admins available
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: 'username', label: 'Username' },
                  { key: 'email', label: 'Email' },
                  { key: 'first_name', label: 'First Name' },
                  { key: 'last_name', label: 'Last Name' },
                  { key: 'status', label: 'Status' },
                  { key: 'last_login', label: 'Last Login' },
                  { key: 'created_at', label: 'Created Date' },
                ]}
                data={t3Admins.map(admin => ({
                  username: admin.username || 'N/A',
                  email: admin.email || 'N/A',
                  first_name: admin.first_name || 'N/A',
                  last_name: admin.last_name || 'N/A',
                  status: admin.status ? admin.status.charAt(0).toUpperCase() + admin.status.slice(1) : 'N/A',
                  last_login: admin.last_login ? new Date(admin.last_login).toLocaleString('en-GB') : 'Never',
                  created_at: admin.created_at ? new Date(admin.created_at).toLocaleString('en-GB') : 'N/A',
                  rawStatus: admin.status || '',
                  id: admin.id,
                }))}
                actions={[
                  {
                    icon: (row) => row.rawStatus?.toLowerCase() === 'active' ? <CheckCircle2 size={16} /> : <XCircle size={16} />,
                    onClick: (row) => handleToggleT3AdminStatus(row),
                    tooltip: (row) => row.rawStatus?.toLowerCase() === 'active' ? 'Deactivate T3 Admin' : 'Activate T3 Admin',
                    variant: (row) => row.rawStatus?.toLowerCase() === 'active' ? 'success' : 'danger',
                  },
                ]}
              />
            )}
            </div>
          );
        })()}

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
