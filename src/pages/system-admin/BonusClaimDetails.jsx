import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { InfoSection, Button, PageHeader } from '../../components/ui';

export default function BonusClaimDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const claimInfo = [
    { label: 'Transaction ID', value: id || 'tx-a1b2c3d4' },
    { label: 'Time', value: '01-11-2025 13:00' },
    { label: 'Status', value: 'Success', badge: true },
  ];

  const claimBy = [
    { label: 'User ID', value: 'U000001' },
    { label: 'Wallet Address', value: '0xF3A....12345' },
  ];

  const claimBonus = [
    { label: 'Bonus Claim', value: '10,000.00 U' },
    { label: 'Net Claim', value: '9,000.00 U' },
    { label: 'Fees', value: '1,000.00 U' },
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
