import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InfoSection, PageHeader } from '../../components/ui';
import { api } from '@/lib/api';

export default function BonusClaimDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [claimData, setClaimData] = useState(null);

  // Extract numeric ID from tx-{id} format if needed
  const claimId = id?.startsWith('tx-') ? id.replace('tx-', '') : id;

  // Fetch claim details
  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        setLoading(true);
        const result = await api.systemadmin.getBonusClaimDetails(claimId);
        if (result && result.success) {
          setClaimData(result.data);
        } else {
          setClaimData(null);
        }
      } catch (error) {
        console.error('Failed to fetch claim details:', error);
        setClaimData(null);
      } finally {
        setLoading(false);
      }
    };

    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bonus Claim Details"
          description="Overview the Details of Bonus Claim Information"
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claimData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bonus Claim Details"
          description="Overview the Details of Bonus Claim Information"
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Claim not found</p>
        </div>
      </div>
    );
  }

  const claimInfo = [
    { label: 'Transaction ID', value: claimData.transaction_id || `tx-${claimData.id}` || 'N/A' },
    { label: 'Time', value: claimData.claimed_at ? new Date(claimData.claimed_at).toLocaleString('en-GB') : 'N/A' },
    { label: 'Status', value: claimData.status || 'N/A', badge: true },
  ];

  const claimBy = [
    { label: 'User ID', value: claimData.user?.id ? `U${claimData.user.id}` : 'N/A' },
    { label: 'Wallet Address', value: claimData.user?.wallet_address || 'N/A' },
  ];

  const claimBonus = [
    { label: 'Bonus Claim', value: `${(claimData.bonus?.bonus_claim || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` },
    { label: 'Net Claim', value: `${(claimData.bonus?.net_claim || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` },
    { label: 'Fees', value: `${(claimData.bonus?.fees || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bonus Claim Details"
        description="Overview the Details of Bonus Claim Information"
      />

      {/* Info Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <InfoSection title="Claim Information" items={claimInfo} columns={1} />
        <InfoSection title="Claim By" items={claimBy} columns={1} />
        <InfoSection title="Bonus Information" items={claimBonus} columns={1} />
      </div>
    </div>
  );
}
