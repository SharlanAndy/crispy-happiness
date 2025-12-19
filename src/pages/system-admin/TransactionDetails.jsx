import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { InfoSection, PageHeader } from '../../components/ui';
import { api, T3SYSTEMADMIN_BASE } from '../../lib/api';
import { t3Service } from '../../services/t3Service';

export default function TransactionDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState(null);

  // Detect if accessed from T3 Admin or System Admin
  const isT3Admin = location.pathname.startsWith('/t3-admin');

  // Extract numeric ID from formatted ID (e.g., "T000001" -> "1" or "tx-123" -> "123" or "1")
  const extractNumericId = (transactionId) => {
    if (!transactionId) return null;
    // Remove "T" prefix and leading zeros, or "tx-" prefix, or return as-is if already numeric
    const numericId = transactionId.toString().replace(/^(T0*|tx-)/, '') || transactionId;
    return numericId;
  };

  // Fetch transaction details
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const numericId = extractNumericId(id);
        const result = isT3Admin
          ? await t3Service.getTransactionDetails(numericId)
          : await api.request(`${T3SYSTEMADMIN_BASE}/transactions/${numericId}`, { method: 'GET' });

        if (result.success && result.data) {
          setTransactionData(result.data);
        } else {
          setError('Transaction not found');
        }
      } catch (error) {
        console.error('Failed to fetch transaction details:', error);
        setError('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id, isT3Admin]);

  // Helper function to format number without rounding - display exact value
  const formatExactValue = (value, currency) => {
    if (value === null || value === undefined || value === '') return `0 ${currency}`;
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Check if it's a valid number
    if (isNaN(numValue)) return `0 ${currency}`;
    // Return as-is without rounding - just convert to string and add currency
    return `${numValue} ${currency}`;
  };

  // Transform API data to match InfoSection format
  const transformTransactionData = (data) => {
    if (!data) return null;

    const currency = data.currency || 'USDT';

    return {
      // Transaction Information
      transactionInfo: {
        id: data.transaction_id || id || data.id,
        type: data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase() : 'Payment',
        time: data.created_at ? new Date(data.created_at).toLocaleString('en-GB') : 'N/A',
        status: data.status === 'completed' ? 'Success' : data.status === 'pending' ? 'Pending' : data.status === 'failed' ? 'Failed' : data.status || 'Success',
      },
      // Receiver Information - API doesn't have merchant data, show N/A
      receiverInfo: {
        merchantId: data.merchant_id || data.merchant?.id || 'N/A',
        companyName: data.merchant?.name || data.merchant?.company_name || 'N/A',
        receiverWalletAddress: data.referral?.receiver_wallet_address || data.receiver_wallet_address || data.merchant?.wallet_address || 'N/A',
      },
      // Sender Information - use user object from API
      senderInfo: {
        agentId: data.agent?.id || data.agent_id || null,
        memberId: data.user?.id || data.user_id || null,
        senderWalletAddress: data.user?.wallet_address || data.sender_wallet_address || 'N/A',
      },
      // Amount Transaction - use exact values from API
      amountInfo: {
        amount: formatExactValue(data.amount, currency),
        platformFees: formatExactValue(data.platform_fees, currency),
        processingFees: formatExactValue(data.processing_fees, currency),
        netProfit: formatExactValue(data.net_profit, currency),
      },
      // Referral Information - use referral object from API
      referralInfo: {
        referralFees: formatExactValue(data.referral?.referral_fees, currency),
        receiverWalletAddress: data.referral?.receiver_wallet_address || data.receiver_wallet_address || data.merchant?.wallet_address || 'N/A',
      },
      // Bonus Distributed - use bonus object from API
      bonusInfo: {
        level1: formatExactValue(data.bonus?.level1, currency),
        level2: formatExactValue(data.bonus?.level2, currency),
        agentlevel1: formatExactValue(data.bonus?.agent_level1, currency),
        agentlevel2: formatExactValue(data.bonus?.agent_level2, currency),
      },
      // Other Information
      otherInfo: {
        merchantOrderNumber: data.merchant_order_no || data.order_no || 'N/A',
        reference: data.reference || data.description || 'N/A',
      },
    };
  };

  const transformedData = transformTransactionData(transactionData);

  // Build items arrays directly from transformed data (no mock functions)
  const transactionInfoItems = transformedData ? [
    { label: 'Transaction ID', value: transformedData.transactionInfo.id || id },
    { label: 'Type of Transaction', value: transformedData.transactionInfo.type },
    { label: 'Time', value: transformedData.transactionInfo.time },
    { label: 'Status', value: transformedData.transactionInfo.status, badge: true },
  ] : [];

  const receiverInfoItems = transformedData ? [
    { label: 'Merchant ID', value: transformedData.receiverInfo.merchantId },
    { label: 'Company Name', value: transformedData.receiverInfo.companyName },
    { label: 'Receiver Wallet Address', value: transformedData.receiverInfo.receiverWalletAddress },
  ] : [];

  const senderInfoItems = transformedData ? [
    { label: 'Agent/Member ID', value: transformedData.senderInfo.agentId && transformedData.senderInfo.memberId 
      ? `${transformedData.senderInfo.agentId} / ${transformedData.senderInfo.memberId}`
      : transformedData.senderInfo.agentId || transformedData.senderInfo.memberId || 'N/A' },
    { label: 'Sender Wallet Address', value: transformedData.senderInfo.senderWalletAddress },
  ] : [];

  const amountInfoItems = transformedData ? [
    { label: 'Amount', value: transformedData.amountInfo.amount },
    { label: 'Platform Fees', value: transformedData.amountInfo.platformFees },
    { label: 'Processing Fees', value: transformedData.amountInfo.processingFees },
    { label: 'Net Profit', value: transformedData.amountInfo.netProfit },
  ] : [];

  const referralInfoItems = transformedData ? [
    { label: 'Referral Fees', value: transformedData.referralInfo.referralFees },
    { label: 'Receiver Wallet Address', value: transformedData.referralInfo.receiverWalletAddress },
  ] : [];

  const bonusInfoItems = transformedData ? [
    { label: 'Level 1', value: transformedData.bonusInfo.level1 },
    { label: 'Level 2', value: transformedData.bonusInfo.level2 },
    { label: 'Agent Level 1', value: transformedData.bonusInfo.agentlevel1 },
    { label: 'Agent Level 2', value: transformedData.bonusInfo.agentlevel2 },
  ] : [];

  const otherInfoItems = transformedData ? [
    { label: 'Merchant Order Number', value: transformedData.otherInfo.merchantOrderNumber },
    { label: 'Reference', value: transformedData.otherInfo.reference },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Transaction Details"
          description="View transaction information"
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transformedData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Transaction Details"
          description="View transaction information"
        />
        <div className="text-center py-8">
          <p className="text-red-500">{error || 'Transaction not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Details"
        description="View transaction information"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 gap-6">
          <InfoSection 
            title="Transaction Information" 
            items={transactionInfoItems} 
            columns={1} 
          />
          <InfoSection 
            title="Receiver Information" 
            items={receiverInfoItems} 
            columns={1} 
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection 
            title="Amount Transaction" 
            items={amountInfoItems} 
            columns={1} 
          />
          <InfoSection 
            title="Sender Information" 
            items={senderInfoItems} 
            columns={1} 
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection 
            title="Referral Information" 
            items={referralInfoItems} 
            columns={1} 
          />
          <InfoSection 
            title="Other Information" 
            items={otherInfoItems} 
            columns={1} 
          />
        </div>
        <InfoSection 
          title="Bonus Distributed" 
          items={bonusInfoItems} 
          columns={1} 
        />
      </div>
    </div>
  );
}
