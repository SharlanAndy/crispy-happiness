import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Wallet, User, Shield, Building2, Book, Cog, CircleDollarSign, Gift } from 'lucide-react';
import { Card, FormField, Button, PageHeader } from '../../components/ui';
import FormLabel from '../../components/form/FormLabel';
import TextInput from '../../components/form/TextInput';
import TextInputWithSuffix from '../../components/form/TextInputWithSuffix';
import SelectInput from '../../components/form/SelectInput';
import PasswordInput from '../../components/form/PasswordInput';
import TextInputWithDropdown from '../../components/form/TextInputWithDropdown';
import countriesAndStates from '../../constant/countriesAndStates.json';
import { authService } from '@/services/authService';
import { api, T3SYSTEMADMIN_BASE } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
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
  const [currentPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  // Determine entity type from path
  const entityType = location.pathname.includes('/agents/') ? 'agent' :
    location.pathname.includes('/merchants/') ? 'merchant' :
      location.pathname.includes('/users/') ? 'user' : null;
  
  // Set initial tab based on entity type
  const [activeTab, setActiveTab] = useState(
    (entityType === 'agent' || entityType === 'user') ? 'profile' : 'info'
  );
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
  
  // State for admin profile (both T3 and System Admin)
  const [adminProfile, setAdminProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // State for entity data (user, agent, merchant) when admin is viewing
  const [entityData, setEntityData] = useState(null);
  const [loadingEntity, setLoadingEntity] = useState(false);
  const { handleApiResponse, showError, showSuccess } = useToast();

  // Normalize API response to handle both PascalCase (from API) and snake_case (for backward compatibility)
  const normalizeUserData = (data) => {
    if (!data) return null;
    return {
      id: data.ID || data.id,
      username: data.Username || data.username,
      walletAddress: data.WalletAddress || data.wallet_address,
      status: data.Status || data.status,
      createdAt: data.CreatedAt || data.created_at,
      totalIncomingFunds: data.TotalIncomingFunds ?? data.total_incoming_funds ?? 0,
      totalOutgoingFunds: data.TotalOutgoingFunds ?? data.total_outgoing_funds ?? 0,
      currentUnclaimFunds: data.CurrentUnclaimFunds ?? data.current_unclaim_funds ?? 0,
      totalClaimedFunds: data.TotalClaimedFunds ?? data.total_claimed_funds ?? 0,
    };
  };

  // Fetch entity data when admin is viewing another user/agent/merchant's settings
  useEffect(() => {
    const fetchEntityData = async () => {
      if (!isAdminView || !id || !entityType) return;

      setLoadingEntity(true);
      try {
        let response = null;
        
        if (entityType === 'user') {
          // Fetch user details
          if (isT3Admin) {
            response = await api.t3admin.getUserDetails(id);
          } else if (isSystemAdmin) {
            response = await api.systemadmin.getUserDetails(id);
          }
        } else if (entityType === 'agent') {
          // Fetch agent details
          if (isT3Admin) {
            response = await api.t3admin.getAgentDetails(id);
          } else if (isSystemAdmin) {
            response = await api.systemadmin.getAgentDetails(id);
          }
        } else if (entityType === 'merchant') {
          // Fetch merchant details
          if (isT3Admin) {
            response = await api.t3admin.getMerchantDetails(id);
          } else if (isSystemAdmin) {
            response = await api.systemadmin.getMerchantDetails(id);
          }
        }
        
        if (response && response.success && response.data) {
          const data = response.data;
          setEntityData(data);
          
          // Normalize and populate form data for users
          if (entityType === 'user') {
            const normalized = normalizeUserData(data);
            setFormData(prev => ({
              ...prev,
              username: normalized?.username || prev.username,
              walletAddress: normalized?.walletAddress || prev.walletAddress,
              accountStatus: normalized?.status || prev.accountStatus,
            }));
          } else if (entityType === 'merchant') {
            // For merchants, populate all fields including rebates
            // Handle both PascalCase (from API) and snake_case (for backward compatibility)
            const merchantGroup = data.UserType || data.user_type || data.merchantGroup || prev.merchantGroup;
            // Normalize UserType to match form values (t1 -> T1, t2 -> T2, t3 -> T3)
            const normalizedGroup = merchantGroup ? merchantGroup.toUpperCase() : prev.merchantGroup;
            
            setFormData(prev => ({
              ...prev,
              // Business Information
              merchantGroup: normalizedGroup,
              companyName: data.BusinessName || data.business_name || data.companyName || prev.companyName,
              ssmNumber: data.SSMNumber || data.ssm_number || data.ssmNumber || prev.ssmNumber,
              merchantType: data.MerchantType || data.merchant_type || data.type || prev.merchantType,
              // Address fields
              addressLine1: data.AddressLine1 || data.address_line1 || data.addressLine1 || prev.addressLine1,
              addressLine2: data.AddressLine2 || data.address_line2 || data.addressLine2 || prev.addressLine2,
              city: data.City || data.city || prev.city,
              state: data.State || data.state || prev.state,
              country: data.Country || data.country || prev.country,
              postcode: data.Postcode || data.postcode || prev.postcode,
              // Wallet and Profile
              walletAddress: data.WalletAddress || data.wallet_address || data.walletAddress || prev.walletAddress,
              accountStatus: data.Status || data.status || prev.accountStatus,
              email: data.Email || data.email || prev.email,
              // Rebates - handle both PascalCase and snake_case
              DirectRebate: data.DirectRebate ?? data.direct_rebate ?? prev.DirectRebate ?? 0,
              L1_rebate: data.L1Rebate ?? data.L1_rebate ?? data.l1_rebate ?? prev.L1_rebate ?? 0,
              L2_rebate: data.L2Rebate ?? data.L2_rebate ?? data.l2_rebate ?? prev.L2_rebate ?? 0,
              Merchant_rebate: data.MerchantRebate ?? data.Merchant_rebate ?? data.merchant_rebate ?? prev.Merchant_rebate ?? 0,
              T1_rebate: data.T1Rebate ?? data.T1_rebate ?? data.t1_rebate ?? prev.T1_rebate ?? 0,
              T2_rebate: data.T2Rebate ?? data.T2_rebate ?? data.t2_rebate ?? prev.T2_rebate ?? 0,
              token_rebate: data.TokenRebate ?? data.token_rebate ?? prev.token_rebate ?? 0,
            }));
          } else {
            // For agents, use the existing location.state logic
            setFormData(prev => ({
              ...prev,
              walletAddress: data.wallet_address || data.walletAddress || prev.walletAddress,
              accountStatus: data.status || data.Status || prev.accountStatus,
            }));
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${entityType} data:`, error);
      } finally {
        setLoadingEntity(false);
      }
    };
    
    fetchEntityData();
  }, [isAdminView, id, entityType, isT3Admin, isSystemAdmin]);

  // Fetch admin profile if viewing own settings (both T3 and System Admin)
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if ((isT3Admin || isSystemAdmin) && !id) {
        // Admin viewing their own settings
        setLoadingProfile(true);
        try {
          let storedProfile = null;
          let response = null;
          
          if (isT3Admin) {
            // First try to get from localStorage
            storedProfile = localStorage.getItem('t3admin_profile');
            if (storedProfile) {
              setAdminProfile(JSON.parse(storedProfile));
            }
            
            // Then fetch fresh data from API
            response = await api.t3admin.getProfile();
          } else if (isSystemAdmin) {
            // First try to get from localStorage
            storedProfile = localStorage.getItem('systemadmin_profile');
            if (storedProfile) {
              setAdminProfile(JSON.parse(storedProfile));
            }
            
            // Then fetch fresh data from API
            response = await api.systemadmin.getProfile();
          }
          
          if (response && response.success && response.data) {
            const profile = response.data;
            setAdminProfile(profile);
            
            // Store in appropriate localStorage key
            if (isT3Admin) {
              localStorage.setItem('t3admin_profile', JSON.stringify(profile));
            } else if (isSystemAdmin) {
              localStorage.setItem('systemadmin_profile', JSON.stringify(profile));
            }
            
            // Update user in localStorage with profile data and role from admin_type
            const user = authService.getCurrentUser();
            if (user) {
              // Determine role from admin_type
              const adminType = profile.admin_type?.toLowerCase();
              let role = user.role; // Keep existing role as fallback
              if (adminType === 'system' || adminType === 'systemadmin' || adminType === 'system_admin') {
                role = 'system-admin';
              } else if (adminType === 't3' || adminType === 't3admin' || adminType === 't3_admin') {
                role = 't3-admin';
              }
              
              const updatedUser = {
                ...user,
                ...profile,
                role: role, // Update role based on admin_type
                wallet_address: profile.wallet_address
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        } catch (error) {
          console.error('Failed to fetch admin profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      }
    };
    fetchAdminProfile();
  }, [isT3Admin, isSystemAdmin, id]);

  // Role-based tab configuration
  const getTabs = () => {
    // Get role from admin_type
    const role = authService.getRoleFromAdminType();
    
    // T3 Admin or System Admin viewing their own settings
    if ((isT3Admin || isSystemAdmin) && !id) {
      return [
        { id: 'profile', label: 'Profile Information', icon: User },
        { id: 'wallet', label: 'Wallet Address', icon: Wallet },
        { id: 'security', label: 'Security', icon: Lock },
      ];
    }
    
    if (isAdminView) {
      // Admin viewing another user's settings
      if (entityType === 'agent') {
        // Agent settings - only show profile, permissions, and status
        return [
          { id: 'profile', label: 'Profile Information', icon: User },
          { id: 'wallet', label: 'Wallet Address', icon: Wallet },
          { id: 'referral', label: 'Referral Information', icon: Cog },
          { id: 'bonus', label: 'Initial Bonus', icon: Gift },
          { id: 'permissions', label: 'Permissions & Access', icon: Shield },
          { id: 'status', label: 'Account Status', icon: Lock },
        ];
      } else if (entityType === 'user') {
        // User settings - only show profile, permissions, and status
        return [
          { id: 'profile', label: 'Profile Information', icon: User },
          { id: 'wallet', label: 'Wallet Address', icon: Wallet },
          { id: 'referral', label: 'Referral Information', icon: Cog },
          { id: 'permissions', label: 'Permissions & Access', icon: Shield },
          { id: 'status', label: 'Account Status', icon: Lock },
        ];
      } else {
        // Merchant settings - show all tabs
        return [
          { id: 'info', label: 'Business Information', icon: Book },
          { id: 'business', label: 'Business Address', icon: Building2 },
          { id: 'wallet', label: 'Wallet Address', icon: Wallet },
          { id: 'rebates', label: 'Rebates', icon: Gift },
          { id: 'referral', label: 'Referral Information', icon: Cog },
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

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle save for merchant updates
  const handleSave = async (sectionKey) => {
    if (!id || entityType !== 'merchant' || !isSystemAdmin) {
      console.warn('Save only available for system admin editing merchants');
      return;
    }

    try {
      let updateData = {};

      // Build update data based on section
      if (sectionKey === 'rebates') {
        updateData = {
          DirectRebate: parseFloat(formData.DirectRebate) || 0,
          L1_rebate: parseFloat(formData.L1_rebate) || 0,
          L2_rebate: parseFloat(formData.L2_rebate) || 0,
          Merchant_rebate: parseFloat(formData.Merchant_rebate) || 0,
          T1_rebate: parseFloat(formData.T1_rebate) || 0,
          T2_rebate: parseFloat(formData.T2_rebate) || 0,
          token_rebate: parseFloat(formData.token_rebate) || 0,
        };
      } else if (sectionKey === 'wallet') {
        updateData = {
          wallet_address: formData.walletAddress,
        };
      } else if (sectionKey === 'profile') {
        updateData = {};
        if (formData.password) {
          updateData.password = formData.password;
        }
        if (formData.email) {
          updateData.email = formData.email;
        }
      } else {
        // For other sections, include all relevant fields
        updateData = {
          company_name: formData.companyName,
          ssm_number: formData.ssmNumber,
          type: formData.merchantType,
          wallet_address: formData.walletAddress,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        if (formData.email) {
          updateData.email = formData.email;
        }
      }

      const result = await api.systemadmin.updateMerchant(id, updateData);
      
      handleApiResponse(result, {
        successMessage: 'Merchant updated successfully!',
        errorMessage: result?.message || 'Failed to update merchant. Please try again.',
      });

      if (result && result.success) {
        // Refresh entity data
        const refreshResponse = await api.systemadmin.getMerchantDetails(id);
        if (refreshResponse && refreshResponse.success && refreshResponse.data) {
          const data = refreshResponse.data;
          setFormData(prev => ({
            ...prev,
            // Update all merchant fields with PascalCase support
            merchantGroup: data.UserType ? data.UserType.toUpperCase() : prev.merchantGroup,
            companyName: data.BusinessName || data.business_name || prev.companyName,
            ssmNumber: data.SSMNumber || data.ssm_number || prev.ssmNumber,
            merchantType: data.MerchantType || data.merchant_type || prev.merchantType,
            addressLine1: data.AddressLine1 || data.address_line1 || prev.addressLine1,
            addressLine2: data.AddressLine2 || data.address_line2 || prev.addressLine2,
            city: data.City || data.city || prev.city,
            state: data.State || data.state || prev.state,
            country: data.Country || data.country || prev.country,
            postcode: data.Postcode || data.postcode || prev.postcode,
            walletAddress: data.WalletAddress || data.wallet_address || prev.walletAddress,
            accountStatus: data.Status || data.status || prev.accountStatus,
            email: data.Email || data.email || prev.email,
            // Rebates - handle both PascalCase and snake_case
            DirectRebate: data.DirectRebate ?? data.direct_rebate ?? prev.DirectRebate ?? 0,
            L1_rebate: data.L1Rebate ?? data.L1_rebate ?? data.l1_rebate ?? prev.L1_rebate ?? 0,
            L2_rebate: data.L2Rebate ?? data.L2_rebate ?? data.l2_rebate ?? prev.L2_rebate ?? 0,
            Merchant_rebate: data.MerchantRebate ?? data.Merchant_rebate ?? data.merchant_rebate ?? prev.Merchant_rebate ?? 0,
            T1_rebate: data.T1Rebate ?? data.T1_rebate ?? data.t1_rebate ?? prev.T1_rebate ?? 0,
            T2_rebate: data.T2Rebate ?? data.T2_rebate ?? data.t2_rebate ?? prev.T2_rebate ?? 0,
            token_rebate: data.TokenRebate ?? data.token_rebate ?? prev.token_rebate ?? 0,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to update merchant:', error);
      showError(error?.message || 'Failed to update merchant. Please try again.');
    }
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

    if (field.type === 'dropdown') {
      return (
        <FormLabel key={field.name} label={field.label}>
          <TextInputWithDropdown
            placeholder={field.placeholder}
            value={field.value}
            onChange={field.onChange}
            dropdownValue={field.dropdownValue}
            onDropdownChange={field.onDropdownChange}
            dropdownOptions={field.dropdownOptions}
          />
        </FormLabel>
      );
    }

    // Default: text input
    return (
      <FormLabel key={field.name} label={field.label}>
        <TextInput
          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
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
    rebates: {
      title: 'Rebates Settings',
      fields: [
        createField('text', 'Direct Rebate', 'DirectRebate', { placeholder: 'eg: 0', type: 'number' }),
        createField('text', 'L1 Rebate', 'L1_rebate', { placeholder: 'eg: 0', type: 'number' }),
        createField('text', 'L2 Rebate', 'L2_rebate', { placeholder: 'eg: 0', type: 'number' }),
        createField('text', 'Merchant Rebate', 'Merchant_rebate', { placeholder: 'eg: 0', type: 'number' }),
        createField('text', 'T1 Rebate', 'T1_rebate', { placeholder: 'eg: 0', type: 'number' }),
        createField('text', 'T2 Rebate', 'T2_rebate', { placeholder: 'eg: 0', type: 'number' }),
        createField('text', 'Token Rebate', 'token_rebate', { placeholder: 'eg: 0', type: 'number' })
      ]
    },
    referral: {
      title: 'Referral Settings',
      fields: entityType === 'merchant' 
        ? [
          createField('text', 'Referral By', 'referralBy', { placeholder: 'Insert referral ID here' }),
          createField('text', 'Referral Fees', 'referralFees', { placeholder: 'eg:1.2' }),
          createField('text', 'Remarks', 'referralRemarks', { placeholder: 'Additional remarks' })
        ]
        : [
          createField('text', 'Referral By', 'referralBy', { placeholder: 'Insert referral ID here' }),
          createField('text', 'Remarks', 'referralRemarks', { placeholder: 'Additional remarks' })
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
    bonus: {
      title: 'Initial Bonus Settings',
      fields: [
        createField('dropdown', 'Initial Bonus Amount', 'initialBonus', { 
          placeholder: 'eg: 100',
          dropdownValue: formData.bonusCurrency || 'USDT',
          onDropdownChange: (e) => handleInputChange('bonusCurrency', e.target.value),
          dropdownOptions: ['USDT', 'USDC', 'ETH']
        })
      ]
    },
    profile: {
      title: 'Profile Information',
        fields: entityType === 'user' ? [
          createField('text', 'Username', 'username', { placeholder: 'Username' }),
          createField('password', 'Password', 'password', { placeholder: 'Insert password here' })
        ] : [
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
        {loadingEntity && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading {entityType} data...</p>
          </div>
        )}
        <h2 className="text-lg font-semibold">{getEntityDisplayName()} {section.title}</h2>
        {sectionKey === 'profile' && (
          <FormField label={getIdLabel()}>
            <input type="text" value={id} readOnly className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" />
          </FormField>
        )}
        {section.fields.map(field => {
          // Make username read-only for users
          if (field.name === 'username' && entityType === 'user') {
            return (
              <FormLabel key={field.name} label={field.label}>
                <input 
                  type="text" 
                  value={field.value || ''} 
                  readOnly 
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                />
              </FormLabel>
            );
          }
          return renderField(field);
        })}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button onClick={() => handleSave(sectionKey)}>Save Changes</Button>
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
          {activeTab === 'rebates' && renderSection('rebates')}
          {activeTab === 'referral' && renderSection('referral')}
          {activeTab === 'fees' && renderSection('fees')}
          {activeTab === 'currency' && renderSection('currency')}
          {activeTab === 'bonus' && renderSection('bonus')}
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
              {loadingProfile ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading profile...</p>
                </div>
              ) : (
                <>
                  <FormField label="Username" icon={<User size={18} />}>
                    <input 
                      type="text" 
                      value={adminProfile?.username || authService.getCurrentUser()?.username || ''} 
                      readOnly 
                      className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                    />
                  </FormField>
                  <FormField label="Email Address" icon={<Mail size={18} />}>
                    <input 
                      type="email" 
                      value={adminProfile?.email || authService.getCurrentUser()?.email || ''} 
                      readOnly 
                      className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                    />
                  </FormField>
                  {adminProfile?.first_name && (
                    <FormField label="First Name" icon={<User size={18} />}>
                      <input 
                        type="text" 
                        value={adminProfile.first_name} 
                        readOnly 
                        className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                      />
                    </FormField>
                  )}
                  {adminProfile?.last_name && (
                    <FormField label="Last Name" icon={<User size={18} />}>
                      <input 
                        type="text" 
                        value={adminProfile.last_name} 
                        readOnly 
                        className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                      />
                    </FormField>
                  )}
                  {adminProfile?.phone && (
                    <FormField label="Phone" icon={<User size={18} />}>
                      <input 
                        type="text" 
                        value={adminProfile.phone} 
                        readOnly 
                        className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                      />
                    </FormField>
                  )}
                  {adminProfile?.character && (
                    <FormField label="Character" icon={<User size={18} />}>
                      <input 
                        type="text" 
                        value={adminProfile.character} 
                        readOnly 
                        className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                      />
                    </FormField>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Wallet Settings</h2>
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                Please be advised that the limit for changing your wallet address is once every 24 hours.
              </div>
              <FormField label="Wallet Address" icon={<Wallet size={18} />}>
                <input 
                  type="text" 
                  value={adminProfile?.wallet_address || authService.getCurrentUser()?.wallet_address || ''} 
                  readOnly
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" 
                />
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
