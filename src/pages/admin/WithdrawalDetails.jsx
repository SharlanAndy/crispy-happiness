import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { InfoSection, Button, PageHeader, ConfirmDialog, VerificationModal } from '../../components/ui';

export default function WithdrawalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage] = useState(1);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);

  // Check if coming from withdrawal history (status will be Approved or Rejected)
  const isFromHistory = location.state?.fromHistory || false;
  const withdrawalStatus = location.state?.withdrawalStatus || 'Pending';
  
  // Determine if approved or rejected
  const isApproved = withdrawalStatus === 'Approved';
  const dateLabel = isApproved ? 'Approved Date' : 'Rejected Date';

  // Different info based on whether from history or management
  const withdrawalInfo = isFromHistory
    ? [
        { label: 'Application ID', value: id || 'AP123455551' },
        { label: 'Transaction ID', value: 'TX987654321' },
        { label: 'Amount Withdraw', value: '10,000.00 U' },
        { label: 'Application Date', value: '01-11-2025 13:00' },
        { label: 'Status', value: withdrawalStatus, badge: true },
      ]
    : [
        { label: 'Application ID', value: id || 'AP123455551' },
        { label: 'Amount Withdraw', value: '10,000.00 U' },
        { label: 'Application Date', value: '01-11-2025 13:00' },
        { label: 'Status', value: 'Pending', badge: true },
      ];

  const applicantInfo = [
    { label: 'User ID', value: 'U123456789' },
    { label: 'Wallet Address', value: '0xF3A1B2C3D4E5F67890123456789ABCDEF012345' },
    { label: 'Previous Withdrawal Amount', value: '500.00 USDT' },
  ];

  // Different "Other Information" based on whether from history or management
  const othersInfo = isFromHistory
    ? [
        { label: 'Username', value: 'admin_user01' },
        { label: dateLabel, value: '02-11-2025 10:30' },
      ]
    : [
        { label: 'Merchant Order Number', value: 'mo12345' },
        { label: 'Reference', value: 'Test123' },
      ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleApproveWithVerification = (credentials) => {
    console.log('Approving withdrawal:', id, 'with credentials:', credentials);
    setApproveModal(false);
    // TODO: api.withdrawal.approve(id, credentials);
    // navigate(-1); // Go back after approval
  };

  const handleReject = () => {
    console.log('Rejecting withdrawal:', id);
    setRejectConfirm(false);
    // TODO: api.withdrawal.reject(id, { reason: 'Invalid wallet' });
    // navigate(-1); // Go back after rejection
  };

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
        {!isFromHistory && (
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
