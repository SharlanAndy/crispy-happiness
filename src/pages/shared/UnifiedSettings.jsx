import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Wallet, User, Shield, Building2, Book, Cog, CircleDollarSign } from 'lucide-react';
import { Card, FormField, Button, PageHeader } from '../../components/ui';
import FormLabel from '../../components/form/FormLabel';
import TextInput from '../../components/form/TextInput';
import TextInputWithSuffix from '../../components/form/TextInputWithSuffix';
import SelectInput from '../../components/form/SelectInput';
import PasswordInput from '../../components/form/PasswordInput';
import countriesAndStates from '../../constant/countriesAndStates.json';
import {
  MERCHANT_TYPES,
  CURRENCIES,
  ACCOUNT_STATUSES,
  PERMISSIONS,
  INITIAL_FORM_DATA
} from '../../constant/settingsMockData';

export default function UnifiedSettings() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine entity type from path
  const entityType = location.pathname.includes('/agents/') ? 'agent' :
    location.pathname.includes('/merchants/') ? 'merchant' :
      location.pathname.includes('/users/') ? 'user' : null;
  
  // Set initial tab based on entity type
  const [activeTab, setActiveTab] = useState(entityType === 'agent' ? 'profile' : 'info');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Populate form with user data from location state (when navigating from DataTable)
  useEffect(() => {
    if (location.state?.userData) {
      const userData = location.state.userData;
      setFormData(prev => ({
        ...prev,
        merchantGroup: userData.tier || userData.merchantGroup || prev.merchantGroup,
        companyName: userData.companyName || userData.name || prev.companyName,
        ssmNumber: userData.ssmNumber || prev.ssmNumber,
        merchantType: userData.type || userData.merchantType || prev.merchantType,
        addressLine1: userData.addressLine1 || prev.addressLine1,
        addressLine2: userData.addressLine2 || prev.addressLine2,
        city: userData.city || prev.city,
        postcode: userData.postcode || prev.postcode,
        state: userData.state || prev.state,
        country: userData.country || prev.country,
        walletAddress: userData.walletAddress || userData.wallet || prev.walletAddress,
        sponsorBy: userData.sponsorBy || userData.sponsor || prev.sponsorBy,
        fees: userData.fees || prev.fees,
        markupFees: userData.markupFees || prev.markupFees,
        processingFees: userData.processingFees || prev.processingFees,
        currencies: userData.currency || userData.currencies || prev.currencies,
        accountStatus: userData.status || userData.accountStatus || prev.accountStatus,
        email: userData.email || prev.email,
      }));
    }
  }, [location.state]);

  const handleCountryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      country: value,
      state: ''
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const countries = Object.keys(countriesAndStates).map(country => ({
    value: country,
    label: country
  }));

  const availableStates = formData.country && countriesAndStates[formData.country]
    ? countriesAndStates[formData.country].map(state => ({
        value: state,
        label: state
      }))
    : [];

  // Determine context: who is viewing and whose settings
  const isSystemAdmin = location.pathname.startsWith('/system-admin');
  const isT3Admin = location.pathname.startsWith('/t3-admin');
  const isMerchant = location.pathname.startsWith('/merchant');
  const isAgent = location.pathname.startsWith('/agent');

  // Determine if admin is viewing another user's settings
  const isAdminView = (isSystemAdmin || isT3Admin) && id;

  // Role-based tab configuration
  const getTabs = () => {
    if (isAdminView) {
      // Admin viewing another user's settings
      if (entityType === 'agent') {
        // Agent settings - only show profile, permissions, and status
        return [
          { id: 'profile', label: 'Profile Information', icon: User },
          { id: 'wallet', label: 'Wallet Address', icon: Wallet },
          { id: 'permissions', label: 'Permissions & Access', icon: Shield },
          { id: 'status', label: 'Account Status', icon: Lock },
        ];
      } else {
        // Merchant/User settings - show all tabs
        return [
          { id: 'info', label: 'Business Information', icon: Book },
          { id: 'business', label: 'Business Address', icon: Building2 },
          { id: 'wallet', label: 'Wallet Address', icon: Wallet },
          { id: 'sponsor', label: 'Sponsor Information', icon: Cog },
          { id: 'fees', label: 'Fees Information', icon: Cog },
          { id: 'currency', label: 'Currency Information', icon: CircleDollarSign },
          { id: 'profile', label: 'Profile Information', icon: User },
          { id: 'permissions', label: 'Permissions & Access', icon: Shield },
          { id: 'status', label: 'Account Status', icon: Lock },
        ];
      }
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

  const getEntityDisplayName = () => {
    return entityType === 'agent' ? 'Agent' : entityType === 'merchant' ? 'Merchant' : 'User';
  };

  // Generic form field renderer
  const renderField = (field) => {
    if (field.condition && !field.condition()) return null;

    if (field.type === 'radio-group') {
      return (
        <FormLabel key={field.name} label={field.label}>
          <div className="flex gap-16 items-center">
            {field.options.map((option) => (
              <label key={option} className="flex gap-2 items-center cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={field.value === option}
                  onChange={() => field.onChange(option)}
                  className="peer sr-only"
                />
                <span className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  field.value === option ? 'border-black' : 'border-gray-300'
                }`}>
                  {field.value === option && <span className="size-2 rounded-full bg-black" />}
                </span>
                <span className="font-medium text-lg text-black">{option}</span>
              </label>
            ))}
          </div>
        </FormLabel>
      );
    }

    if (field.type === 'text-suffix') {
      return (
        <FormLabel key={field.name} label={field.label}>
          <TextInputWithSuffix
            placeholder={field.placeholder}
            value={field.value}
            onChange={field.onChange}
            suffix={field.suffix}
          />
        </FormLabel>
      );
    }

    if (field.type === 'select') {
      const options = field.options === 'MERCHANT_TYPES' ? MERCHANT_TYPES :
                      field.options === 'CURRENCIES' ? CURRENCIES :
                      field.options;
      return (
        <FormLabel key={field.name} label={field.label}>
          <SelectInput
            value={field.value}
            onChange={field.onChange}
            options={options}
            placeholder={field.placeholder}
          />
        </FormLabel>
      );
    }

    if (field.type === 'password') {
      return (
        <FormLabel key={field.name} label={field.label}>
          <PasswordInput
            placeholder={field.placeholder}
            value={field.value}
            onChange={field.onChange}
          />
        </FormLabel>
      );
    }

    // Default: text input
    return (
      <FormLabel key={field.name} label={field.label}>
        <TextInput
          type={field.type === 'email' ? 'email' : 'text'}
          placeholder={field.placeholder}
          value={field.value}
          onChange={field.onChange}
        />
      </FormLabel>
    );
  };

  // Simplified form configuration - auto-binds to formData
  const createField = (type, label, name, options = {}) => ({
    type,
    label,
    name,
    value: formData[name],
    onChange: name === 'country' ? (e) => handleCountryChange(e.target.value) : 
              (type === 'radio-group' ? (val) => handleInputChange(name, val) : 
              (e) => handleInputChange(name, e.target.value)),
    ...options
  });

  const formSections = {
    info: {
      title: 'Business Information',
      fields: [
        createField('radio-group', "Merchant's Group", 'merchantGroup', { options: ['T1', 'T2', 'T3'] }),
        createField('text', 'Company Name', 'companyName', { placeholder: 'Insert company name here' }),
        createField('text', 'SSM Number', 'ssmNumber', { placeholder: 'Insert SSM number here' }),
        createField('select', "Merchant's Type", 'merchantType', { placeholder: 'Select type of business', options: 'MERCHANT_TYPES' }),
        createField('text', 'Specify Merchant Type', 'merchantTypeOther', { 
          placeholder: 'Please specify the merchant type',
          condition: () => formData.merchantType === 'Others'
        })
      ]
    },
    business: {
      title: 'Business Address',
      fields: [
        createField('text', 'Address Line 1', 'addressLine1', { placeholder: 'Insert address line 1 here' }),
        createField('text', 'Address Line 2', 'addressLine2', { placeholder: 'Insert address line 2 here' }),
        createField('text', 'City', 'city', { placeholder: 'Insert city name here' }),
        createField('text', 'Postcode', 'postcode', { placeholder: 'Insert postcode here' }),
        createField('select', 'State', 'state', { placeholder: 'Select State', options: availableStates }),
        createField('select', 'Country', 'country', { placeholder: 'Select Country', options: countries })
      ]
    },
    wallet: {
      title: 'Wallet Settings',
      fields: [createField('text', 'Wallet Address', 'walletAddress', { placeholder: 'Insert wallet address here' })]
    },
    sponsor: {
      title: 'Sponsor Settings',
      fields: [
        createField('text', 'Sponsor By', 'sponsorBy', { placeholder: 'Insert referral ID here' }),
        createField('text', 'Fees', 'fees', { placeholder: 'eg:1.2' })
      ]
    },
    fees: {
      title: 'Fees Settings',
      fields: [
        createField('text-suffix', 'Markup Fees (%)', 'markupFees', { placeholder: 'eg: 1.2', suffix: '%' }),
        createField('text-suffix', 'Processing Fees (%)', 'processingFees', { placeholder: 'eg: 1.2', suffix: '%' })
      ]
    },
    currency: {
      title: 'Currency Settings',
      fields: [createField('select', 'Currencies', 'currencies', { placeholder: 'Select Currencies', options: 'CURRENCIES' })]
    },
    profile: {
      title: 'Profile Information',
      fields: [
        createField('email', 'Email', 'email', { placeholder: 'Insert email here' }),
        createField('password', 'Password', 'password', { placeholder: 'Insert password here' })
      ]
    }
  };

  // Render generic section from config
  const renderSection = (sectionKey) => {
    const section = formSections[sectionKey];
    if (!section) return null;

    // Get appropriate ID label based on entity type
    const getIdLabel = () => {
      if (entityType === 'agent') return 'Agent ID';
      if (entityType === 'merchant') return 'Merchant ID';
      if (entityType === 'user') return 'User ID';
      return 'ID';
    };

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">{getEntityDisplayName()} {section.title}</h2>
        {sectionKey === 'profile' && (
          <FormField label={getIdLabel()}>
            <input type="text" value={id} readOnly className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" />
          </FormField>
        )}
        {section.fields.map(field => renderField(field))}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isAdminView) {
      // Admin managing another user's settings
      return (
        <>
          {activeTab === 'info' && renderSection('info')}
          {activeTab === 'business' && renderSection('business')}
          {activeTab === 'wallet' && renderSection('wallet')}
          {activeTab === 'sponsor' && renderSection('sponsor')}
          {activeTab === 'fees' && renderSection('fees')}
          {activeTab === 'currency' && renderSection('currency')}
          {activeTab === 'profile' && renderSection('profile')}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Permissions & Access Control</h2>
              <div className="space-y-4">
                {PERMISSIONS.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{permission.label}</p>
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.permissions[permission.id]} 
                      onChange={(e) => handleInputChange('permissions', {
                        ...formData.permissions,
                        [permission.id]: e.target.checked
                      })}
                      className="w-5 h-5" 
                    />
                  </div>
                ))}
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
                <select 
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  value={formData.accountStatus}
                  onChange={(e) => handleInputChange('accountStatus', e.target.value)}
                >
                  {ACCOUNT_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Suspension Reason (if applicable)">
                <textarea 
                  className="w-full px-3 py-2 rounded-md border bg-background" 
                  rows={3} 
                  placeholder="Enter reason for suspension..."
                />
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
