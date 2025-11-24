import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Save, Lock, Mail, Wallet, User, Shield } from 'lucide-react';
import { Card, FormField, Button, PageHeader } from '../../components/ui';

export default function UnifiedSettings() {
  const { id } = useParams(); // For admin viewing other users' settings
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // Determine context: who is viewing and whose settings
  const isSystemAdmin = location.pathname.startsWith('/system-admin');
  const isT3Admin = location.pathname.startsWith('/t3-admin');
  const isMerchant = location.pathname.startsWith('/merchant');
  const isAgent = location.pathname.startsWith('/agent');

  // Determine if admin is viewing another user's settings
  const isAdminView = (isSystemAdmin || isT3Admin) && id;

  // Determine entity type from path
  const entityType = location.pathname.includes('/agents/') ? 'agent' :
    location.pathname.includes('/merchants/') ? 'merchant' :
      location.pathname.includes('/users/') ? 'user' : null;

  // Role-based tab configuration
  const getTabs = () => {
    if (isAdminView) {
      // Admin viewing another user's settings
      return [
        { id: 'profile', label: 'Profile Information', icon: User },
        { id: 'permissions', label: 'Permissions & Access', icon: Shield },
        { id: 'status', label: 'Account Status', icon: Lock },
      ];
    } else {
      // User viewing their own settings
      return [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'wallet', label: 'Wallet Address', icon: Wallet },
        { id: 'security', label: 'Security', icon: Lock },
      ];
    }
  };

  const tabs = getTabs();

  // Determine the back navigation path
  const getBackPath = () => {
    if (isAdminView) {
      // Admin viewing another user's settings - go back to the list page
      if (isSystemAdmin) {
        if (entityType === 'agent') return '/system-admin/agents';
        if (entityType === 'merchant') return '/system-admin/merchants';
        if (entityType === 'user') return '/system-admin/users';
      } else if (isT3Admin) {
        if (entityType === 'merchant') return '/t3-admin/merchants';
        if (entityType === 'user') return '/t3-admin/users';
        return '/t3-admin'; // fallback
      }
      return '/system-admin'; // fallback
    } else {
      // User viewing their own settings - go back to their dashboard
      if (isAgent) return '/agent';
      if (isMerchant) return '/merchant';
      return '/'; // fallback
    }
  };

  const handleCancel = () => {
    navigate(getBackPath());
  };

  const renderContent = () => {
    if (isAdminView) {
      // Admin managing another user's settings
      return (
        <>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">
                {entityType === 'agent' ? 'Agent' : entityType === 'merchant' ? 'Merchant' : 'User'} Profile Information
              </h2>
              <FormField label="User ID">
                <input type="text" value={id} readOnly className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" />
              </FormField>
              <FormField label="Email Address" icon={<Mail size={18} />}>
                <input type="email" value="user@example.com" className="w-full px-3 py-2 rounded-md border bg-background" />
              </FormField>
              <FormField label="Status">
                <select className="w-full px-3 py-2 rounded-md border bg-background">
                  <option>Active</option>
                  <option>Suspended</option>
                  <option>Inactive</option>
                </select>
              </FormField>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Permissions & Access Control</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Can Create Transactions</p>
                    <p className="text-sm text-muted-foreground">Allow this user to create new transactions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Can Manage Team</p>
                    <p className="text-sm text-muted-foreground">Allow this user to manage their team members</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Can Withdraw Funds</p>
                    <p className="text-sm text-muted-foreground">Allow this user to withdraw funds</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button>Update Permissions</Button>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Account Status Management</h2>
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                ⚠️ Changing account status will affect user's access to the platform
              </div>
              <FormField label="Account Status">
                <select className="w-full px-3 py-2 rounded-md border bg-background">
                  <option>Active</option>
                  <option>Suspended</option>
                  <option>Pending Verification</option>
                  <option>Deactivated</option>
                </select>
              </FormField>
              <FormField label="Suspension Reason (if applicable)">
                <textarea className="w-full px-3 py-2 rounded-md border bg-background" rows={3} placeholder="Enter reason for suspension..."></textarea>
              </FormField>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button variant="danger">Update Status</Button>
              </div>
            </div>
          )}
        </>
      );
    } else {
      // User managing their own settings
      return (
        <>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <FormField label="Email Address" icon={<Mail size={18} />}>
                <input type="email" value="testing@gmail.com" readOnly className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" />
              </FormField>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Wallet Settings</h2>
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                Please be advised that the limit for changing your wallet address is once every 24 hours.
              </div>
              <FormField label="Wallet Address" icon={<Wallet size={18} />}>
                <input type="text" value="0xF3A1B2C3D4E5F67890123456789AB45" className="w-full px-3 py-2 rounded-md border bg-background" />
              </FormField>
              <FormField label="TAC Code">
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter TAC from Email" className="flex-1 px-3 py-2 rounded-md border bg-background" />
                  <Button variant="secondary">Request TAC</Button>
                </div>
              </FormField>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button>Update Wallet</Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <FormField label="Current Password" icon={<Lock size={18} />}>
                <input type="password" value="********" className="w-full px-3 py-2 rounded-md border bg-background" />
              </FormField>
              <FormField label="New Password" icon={<Lock size={18} />}>
                <input type="password" placeholder="Enter new password" className="w-full px-3 py-2 rounded-md border bg-background" />
              </FormField>
              <FormField label="Confirm New Password" icon={<Lock size={18} />}>
                <input type="password" placeholder="Re-enter new password" className="w-full px-3 py-2 rounded-md border bg-background" />
              </FormField>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button>Update Password</Button>
              </div>
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdminView ? `${entityType?.charAt(0).toUpperCase() + entityType?.slice(1)} Settings` : "Settings"}
        description={isAdminView ? `Manage settings for ${entityType} ${id}` : "Manage your account settings and preferences."}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="md:col-span-2">
          {renderContent()}
        </Card>
      </div>
    </div>
  );
}
