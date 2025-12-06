import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { InfoSection, Button, PageHeader } from '../../components/ui';

export default function AccountDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage] = useState(1);

  const accountInfo = [
    { label: 'Admin ID', value: id || '001' },
    { label: 'Username', value: 'finance1' },
    { label: 'Character', value: 'Finance' },
    { label: 'Email', value: 'finance1@nbn.com' },
    { label: 'Last Login', value: '2 hours ago' },
    { label: 'Created On', value: '01-11-2025 13:00' },
    { label: 'Status', value: 'Active', badge: true },
  ];

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Details"
        description="Overview the Details of Account’s User Information"
      />

      <InfoSection title="Account Information" items={accountInfo} columns={2} />
    </div>
  );
}
