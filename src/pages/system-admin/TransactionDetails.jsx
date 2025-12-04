import { useParams } from 'react-router-dom';
import { InfoSection, PageHeader } from '../../components/ui';
import { getTransactionInfoItems } from '../../constant/transactionMockData';

export default function TransactionDetails() {
  const { id } = useParams();

  const transactionInfo = getTransactionInfoItems(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Details"
        description="View transaction information"
      />

      <InfoSection title="Transaction Information" items={transactionInfo} columns={2} />
    </div>
  );
}
