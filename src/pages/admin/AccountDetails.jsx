import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { InfoSection, Button, PageHeader } from '../../components/ui';
import { t3Service } from '@/services/t3Service';

export default function AccountDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);

  const isT3Admin = location.pathname.startsWith('/t3-admin');

  // Fetch account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!isT3Admin || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await t3Service.getAccountDetails(id);
        if (result.success) {
          setAccountData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch account details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountDetails();
  }, [id, isT3Admin]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Format account info
  const accountInfo = accountData ? [
    { label: 'Admin ID', value: accountData.id?.toString() || id || '001' },
    { label: 'Username', value: accountData.username || 'N/A' },
    { label: 'Character', value: accountData.character || 'Finance' },
    { label: 'Email', value: accountData.email || 'N/A' },
    { label: 'Wallet Address', value: accountData.wallet_address || 'N/A' },
    { label: 'Last Login', value: accountData.last_login ? new Date(accountData.last_login).toLocaleString('en-GB') : 'Never' },
    { label: 'Created On', value: accountData.created_at ? new Date(accountData.created_at).toLocaleString('en-GB') : 'N/A' },
    { label: 'Status', value: accountData.status || 'Active', badge: true },
  ] : [
    { label: 'Admin ID', value: id || '001' },
    { label: 'Username', value: 'finance1' },
    { label: 'Character', value: 'Finance' },
    { label: 'Email', value: 'finance1@nbn.com' },
    { label: 'Last Login', value: '2 hours ago' },
    { label: 'Created On', value: '01-11-2025 13:00' },
    { label: 'Status', value: 'Active', badge: true },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Details"
          description="Overview the Details of Account's User Information"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Details"
        description="Overview the Details of Account's User Information"
      />

      <InfoSection title="Account Information" items={accountInfo} columns={2} />
    </div>
  );
}
