import { useState } from 'react';
import { Lock, Mail, Wallet } from 'lucide-react';
import { Card, FormField, Button, PageHeader, Tabs } from '../../components/ui';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings and preferences." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'wallet' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
            >
              Wallet Address
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
            >
              Security
            </button>
          </div>
        </Card>

        <Card className="md:col-span-2">
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
                <Button variant="secondary">Cancel</Button>
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
                <Button variant="secondary">Cancel</Button>
                <Button>Update Password</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
