import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InfoSection, PageHeader } from '../../components/ui';
import { getTransactionInfoItems, getTransactionReceiver, getTransactionSender, getTransactionInfo, getTransactionReferral, getTransactionBonus, getTransactionOthers } from '../../constant/transactionMockData';

export default function TransactionDetails() {
  const { id } = useParams();
  const [currentPage] = useState(1);
  
  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const sections = [
    { title: 'Transaction Information', items: getTransactionInfoItems(id) },
    { title: 'Receiver Information', items: getTransactionReceiver(id) },
    { title: 'Sender Information', items: getTransactionSender(id) },
    { title: 'Amount Transaction', items: getTransactionInfo(id) },
    { title: 'Referral Information', items: getTransactionReferral() },
    { title: 'Bonus Distributed', items: getTransactionBonus(id) },
    { title: 'Other Information', items: getTransactionOthers(id) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Details"
        description="View transaction information"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 gap-6">
          <InfoSection title="Transaction Information" items={getTransactionInfoItems(id)} columns={1} />
          <InfoSection title="Receiver Information" items={getTransactionReceiver(id)} columns={1} />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection title="Amount Transaction" items={getTransactionInfo(id)} columns={1} />
          <InfoSection title="Sender Information" items={getTransactionSender(id)} columns={1} />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection title="Referral Information" items={getTransactionReferral()} columns={1} />
          <InfoSection title="Other Information" items={getTransactionOthers(id)} columns={1} />
        </div>
        <InfoSection title="Bonus Distributed" items={getTransactionBonus(id)} columns={1} />
      </div>
    </div>
  );
}
