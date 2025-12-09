import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { InfoSection, Button, PageHeader, ConfirmDialog, VerificationModal } from '../../components/ui';
import { t3Service } from '@/services/t3Service';

export default function WithdrawalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage] = useState(1);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawalData, setWithdrawalData] = useState(null);

  // Check if coming from withdrawal history (status will be Approved or Rejected)
  const isFromHistory = location.state?.fromHistory || location.pathname.includes('withdrawal-history');
  const withdrawalStatus = location.state?.withdrawalStatus || withdrawalData?.status || 'Pending';
  
  // Determine if approved or rejected
  const isApproved = withdrawalStatus === 'Approved';
  const dateLabel = isApproved ? 'Approved Date' : 'Rejected Date';

  // Fetch withdrawal details
  useEffect(() => {
    const fetchWithdrawalDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await t3Service.getWithdrawalDetails(id);
        if (result.success) {
          setWithdrawalData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch withdrawal details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawalDetails();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB');
  };

  // Different info based on whether from history or management
  const withdrawalInfo = withdrawalData ? (isFromHistory
    ? [
        { label: 'Application ID', value: withdrawalData.application_id || id || 'N/A' },
        { label: 'Transaction ID', value: withdrawalData.transaction_id || 'N/A' },
        { label: 'Amount Withdraw', value: `${formatCurrency(withdrawalData.amount)} U` },
        { label: 'Application Date', value: formatDate(withdrawalData.created_at) },
        { label: 'Status', value: withdrawalData.status || 'Pending', badge: true },
      ]
    : [
        { label: 'Application ID', value: withdrawalData.application_id || id || 'N/A' },
        { label: 'Amount Withdraw', value: `${formatCurrency(withdrawalData.amount)} U` },
        { label: 'Application Date', value: formatDate(withdrawalData.created_at) },
        { label: 'Status', value: withdrawalData.status || 'Pending', badge: true },
      ]) : [
        { label: 'Application ID', value: id || 'AP123455551' },
        { label: 'Amount Withdraw', value: '10,000.00 U' },
        { label: 'Application Date', value: '01-11-2025 13:00' },
        { label: 'Status', value: 'Pending', badge: true },
      ];

  const applicantInfo = withdrawalData ? [
    { label: 'User ID', value: withdrawalData.user_id ? `U${withdrawalData.user_id}` : 'N/A' },
    { label: 'Wallet Address', value: withdrawalData.wallet_address || 'N/A' },
    { label: 'Previous Withdrawal Amount', value: 'N/A' }, // TODO: Fetch from API if available
  ] : [
    { label: 'User ID', value: 'U123456789' },
    { label: 'Wallet Address', value: '0xF3A1B2C3D4E5F67890123456789ABCDEF012345' },
    { label: 'Previous Withdrawal Amount', value: '500.00 USDT' },
  ];

  // Different "Other Information" based on whether from history or management
  const othersInfo = withdrawalData ? (isFromHistory
    ? [
        { label: 'Username', value: withdrawalData.verifier_username || withdrawalData.username || 'N/A' },
        { label: dateLabel, value: formatDate(withdrawalData.verified_at) },
      ]
    : [
        { label: 'Merchant Order Number', value: withdrawalData.merchant_order_no || 'N/A' },
        { label: 'Reference', value: withdrawalData.reference || 'N/A' },
      ]) : [
        { label: 'Merchant Order Number', value: 'mo12345' },
        { label: 'Reference', value: 'Test123' },
      ];

  const handleApproveWithVerification = async (credentials) => {
    try {
      const result = await t3Service.approveWithdrawal(id);
      if (result.success) {
        alert('Withdrawal approved successfully!');
        navigate(-1); // Go back after approval
      } else {
        alert('Failed to approve withdrawal. Please try again.');
      }
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
      alert('Failed to approve withdrawal. Please try again.');
    } finally {
      setApproveModal(false);
    }
  };

  const handleReject = async () => {
    try {
      const result = await t3Service.rejectWithdrawal(id);
      if (result.success) {
        alert('Withdrawal rejected successfully!');
        navigate(-1); // Go back after rejection
      } else {
        alert('Failed to reject withdrawal. Please try again.');
      }
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
      alert('Failed to reject withdrawal. Please try again.');
    } finally {
      setRejectConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Withdrawal Details"
          description="View withdrawal application information and other details"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading withdrawal details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Withdrawal Details"
          description="View withdrawal application information and other details"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoSection title="Withdrawal Information" items={withdrawalInfo} columns={1} />
          <div className="grid grid-cols-1 gap-6">
            <InfoSection title="Applicant Information" items={applicantInfo} columns={1} />
            <InfoSection 
              title={isFromHistory ? "Verify By" : "Other Information"} 
              items={othersInfo} 
              columns={1} 
            />
          </div>
        </div>

        {/* Action Buttons - Only show for pending withdrawals */}
        {!isFromHistory && withdrawalData?.status === 'Pending' && (
          <div className="flex gap-5 justify-end items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex gap-2.5 items-center justify-center p-3 border border-[#a1abaa] rounded-[9px] hover:bg-gray-50 transition-colors"
            >
              <span className="text-md font-semibold text-black whitespace-nowrap">
                Cancel
              </span>
            </button>
            
            <button
              onClick={() => setRejectConfirm(true)}
              className="flex gap-2.5 items-center justify-center p-3 bg-[#757575] rounded-[9px] hover:bg-[#666666] transition-colors"
            >
              <X size={24} className="text-white" />
              <span className="text-md font-semibold text-white whitespace-nowrap">
                Reject
              </span>
            </button>

            <button
              onClick={() => setApproveModal(true)}
              className="flex gap-2.5 items-center justify-center p-3 bg-black rounded-[9px] hover:bg-gray-800 transition-colors"
            >
              <Check size={24} className="text-white" />
              <span className="text-md font-semibold text-white whitespace-nowrap">
                Approve
              </span>
            </button>
          </div>
        )}
      </div>

      {!isFromHistory && (
        <>
          {/* Approval Verification Modal */}
          <VerificationModal
            isOpen={approveModal}
            onClose={() => setApproveModal(false)}
            onConfirm={handleApproveWithVerification}
            title="Verification"
            message={`Please verify your credentials to approve withdrawal ${id}`}
          />

          {/* Reject Confirmation Dialog */}
          <ConfirmDialog
            isOpen={rejectConfirm}
            onClose={() => setRejectConfirm(false)}
            onConfirm={handleReject}
            title="Reject Withdrawal"
            message={`Are you sure you want to reject withdrawal ${id}?`}
            confirmText="Reject"
            variant="danger"
          />
        </>
      )}
    </>
  );
}
