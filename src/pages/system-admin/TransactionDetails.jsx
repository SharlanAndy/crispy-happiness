import { useParams } from 'react-router-dom';
import { InfoSection, PageHeader } from '../../components/ui';
import { getTransactionInfoItems, getTransactionReceiver, getTransactionSender, getTransactionInfo, getTransactionBonus, getTransactionOthers } from '../../constant/transactionMockData';

export default function TransactionDetails() {
  const { id } = useParams();

  const sections = [
    { title: 'Transaction Information', items: getTransactionInfoItems(id) },
    { title: 'Receiver Information', items: getTransactionReceiver(id) },
    { title: 'Sender Information', items: getTransactionSender(id) },
    { title: 'Amount Transaction', items: getTransactionInfo(id) },
    { title: 'Bonus Distributed', items: getTransactionBonus(id) },
    { title: 'Other Information', items: getTransactionOthers(id) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Details"
        description="View transaction information"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section) => (
          <InfoSection key={section.title} title={section.title} items={section.items} columns={1} />
        ))}
      </div>
    </div>
  );
}
