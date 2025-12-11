import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { InfoSection, PageHeader } from '../../components/ui';
import { api, T3SYSTEMADMIN_BASE } from '../../lib/api';
import { t3Service } from '../../services/t3Service';
import { getTransactionInfoItems, getTransactionReceiver, getTransactionSender, getTransactionInfo, getTransactionReferral, getTransactionBonus, getTransactionOthers } from '../../constant/transactionMockData';

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

  // Transform API data to match InfoSection format
  const transformTransactionData = (data) => {
    if (!data) return null;

    const currency = data.currency || 'USDT';
    const amount = parseFloat(data.amount || 0);
    const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return {
      // Transaction Information
      transactionInfo: {
        id: id || data.id || data.transaction_id,
        type: data.type || 'Payment',
        time: data.created_at ? new Date(data.created_at).toLocaleString('en-GB') : 'N/A',
        status: data.status === 'completed' ? 'Success' : data.status === 'pending' ? 'Pending' : data.status === 'failed' ? 'Failed' : data.status || 'Success',
      },
      // Receiver Information
      receiverInfo: {
        merchantId: data.merchant_id || data.merchant?.id || 'N/A',
        companyName: data.merchant?.name || data.merchant?.company_name || 'N/A',
        receiverWalletAddress: data.receiver_wallet_address || data.merchant?.wallet_address || 'N/A',
      },
      // Sender Information
      senderInfo: {
        agentId: data.agent_id || data.agent?.id || 'N/A',
        memberId: data.user_id || data.user?.id || 'N/A',
        senderWalletAddress: data.sender_wallet_address || data.user?.wallet_address || 'N/A',
      },
      // Amount Transaction
      amountInfo: {
        amount: `${formattedAmount} ${currency}`,
        platformFees: `${((amount * 0.005) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        processingFees: `${((amount * 0.005) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        netProfit: `${((amount * 0.01) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      },
      // Referral Information
      referralInfo: {
        referralFees: `${((amount * 0.004) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        receiverWalletAddress: data.receiver_wallet_address || data.merchant?.wallet_address || 'N/A',
      },
      // Bonus Distributed
      bonusInfo: {
        level1: `${((amount * 0.002) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        level2: `${((amount * 0.001) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        agentlevel1: `${((amount * 0.0015) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        agentlevel2: `${((amount * 0.0005) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      },
      // Other Information
      otherInfo: {
        merchantOrderNumber: data.merchant_order_no || data.order_no || 'N/A',
        reference: data.reference || data.description || 'N/A',
      },
    };
  };

  const transformedData = transformTransactionData(transactionData);

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
            items={getTransactionInfoItems(id, transformedData.transactionInfo)} 
            columns={1} 
          />
          <InfoSection 
            title="Receiver Information" 
            items={getTransactionReceiver(id, transformedData.receiverInfo)} 
            columns={1} 
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection 
            title="Amount Transaction" 
            items={getTransactionInfo(id, transformedData.amountInfo)} 
            columns={1} 
          />
          <InfoSection 
            title="Sender Information" 
            items={getTransactionSender(id, transformedData.senderInfo)} 
            columns={1} 
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection 
            title="Referral Information" 
            items={getTransactionReferral(transformedData.referralInfo)} 
            columns={1} 
          />
          <InfoSection 
            title="Other Information" 
            items={getTransactionOthers(id, transformedData.otherInfo)} 
            columns={1} 
          />
        </div>
        <InfoSection 
          title="Bonus Distributed" 
          items={getTransactionBonus(id, transformedData.bonusInfo)} 
          columns={1} 
        />
      </div>
    </div>
  );
}
