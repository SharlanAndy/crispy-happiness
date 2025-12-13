import { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { FormLabel, FormSection, TextInput, TextInputWithSuffix, PasswordInput, SelectInput } from '../form';
import merchantTypes from '../../constant/merchantTypes.json';
import countriesAndStates from '../../constant/countriesAndStates.json';

const INITIAL_FORM_DATA = {
  merchantGroup: 'T1',
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  companyName: '',
  ssmNumber: '',
  merchantType: 'F&B',
  merchantTypeOther: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  state: 'Selangor',
  country: 'Malaysia',
  walletAddress: '',
  sponsorBy: '',
  fees: '',
  markupFees: '',
  processingFees: '',
  L1Rebate: '',
  L2Rebate: '',
  T1Rebate: '',
  T2Rebate: '',
  MerchantRebate: '',
  DirectRebate: '',
  currencies: '🇲🇾 Malaysia - RM',
};

const CURRENCY_OPTIONS = ['🇲🇾 Malaysia - RM', '🇸🇬 Singapore - SGD', '🇺🇸 USA - USD'];

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Business Info' },
  { id: 3, label: 'Address' },
  { id: 4, label: 'Wallet & Referral' },
  { id: 5, label: 'Fees & Rebates' },
  { id: 6, label: 'Currency & Preview' },
];

export default function AddMerchantModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const countries = Object.keys(countriesAndStates);
  const availableStates = countriesAndStates[formData.country] || [];

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password should be at least 6 characters
    return password && password.length >= 6;
  };

  const validateRequired = (value) => {
    return value && value.toString().trim() !== '';
  };

  const validatePhone = (phone) => {
    // Basic phone validation - at least 8 digits
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phone && phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
  };

  const validateNumber = (value) => {
    if (!value || value.toString().trim() === '') return true; // Optional fields
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  // Validate current step
  const validateStep = (step) => {
    const stepErrors = {};

    switch (step) {
      case 1: // Basic Info
        if (!validateRequired(formData.username)) {
          stepErrors.username = 'Username is required';
        }
        if (!validateRequired(formData.email)) {
          stepErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          stepErrors.email = 'Please enter a valid email address';
        }
        if (!validatePassword(formData.password)) {
          stepErrors.password = 'Password must be at least 6 characters';
        }
        if (!validateRequired(formData.firstName)) {
          stepErrors.firstName = 'First name is required';
        }
        if (!validateRequired(formData.lastName)) {
          stepErrors.lastName = 'Last name is required';
        }
        if (!validateRequired(formData.phone)) {
          stepErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
          stepErrors.phone = 'Please enter a valid phone number';
        }
        if (!validateRequired(formData.merchantGroup)) {
          stepErrors.merchantGroup = 'Merchant group is required';
        }
        break;

      case 2: // Business Info
        if (!validateRequired(formData.companyName)) {
          stepErrors.companyName = 'Company name is required';
        }
        if (!validateRequired(formData.ssmNumber)) {
          stepErrors.ssmNumber = 'SSM number is required';
        }
        if (!validateRequired(formData.merchantType)) {
          stepErrors.merchantType = 'Merchant type is required';
        }
        if (formData.merchantType === 'Others' && !validateRequired(formData.merchantTypeOther)) {
          stepErrors.merchantTypeOther = 'Please specify the merchant type';
        }
        break;

      case 3: // Address
        if (!validateRequired(formData.addressLine1)) {
          stepErrors.addressLine1 = 'Address line 1 is required';
        }
        if (!validateRequired(formData.city)) {
          stepErrors.city = 'City is required';
        }
        if (!validateRequired(formData.postcode)) {
          stepErrors.postcode = 'Postcode is required';
        }
        if (!validateRequired(formData.state)) {
          stepErrors.state = 'State is required';
        }
        if (!validateRequired(formData.country)) {
          stepErrors.country = 'Country is required';
        }
        break;

      case 4: // Wallet & Referral
        if (!validateRequired(formData.walletAddress)) {
          stepErrors.walletAddress = 'Wallet address is required';
        }
        // Referral fields are optional, but if filled, validate format
        if (formData.referralFees && !validateNumber(formData.referralFees)) {
          stepErrors.referralFees = 'Please enter a valid number';
        }
        break;

      case 5: // Fees & Rebates
        if (formData.markupFees && !validateNumber(formData.markupFees)) {
          stepErrors.markupFees = 'Please enter a valid number';
        }
        if (formData.processingFees && !validateNumber(formData.processingFees)) {
          stepErrors.processingFees = 'Please enter a valid number';
        }
        if (formData.L1Rebate && !validateNumber(formData.L1Rebate)) {
          stepErrors.L1Rebate = 'Please enter a valid number';
        }
        if (formData.L2Rebate && !validateNumber(formData.L2Rebate)) {
          stepErrors.L2Rebate = 'Please enter a valid number';
        }
        if (formData.T1Rebate && !validateNumber(formData.T1Rebate)) {
          stepErrors.T1Rebate = 'Please enter a valid number';
        }
        if (formData.T2Rebate && !validateNumber(formData.T2Rebate)) {
          stepErrors.T2Rebate = 'Please enter a valid number';
        }
        if (formData.MerchantRebate && !validateNumber(formData.MerchantRebate)) {
          stepErrors.MerchantRebate = 'Please enter a valid number';
        }
        if (formData.DirectRebate && !validateNumber(formData.DirectRebate)) {
          stepErrors.DirectRebate = 'Please enter a valid number';
        }
        break;

      case 6: // Currency & Preview
        if (!validateRequired(formData.currencies)) {
          stepErrors.currencies = 'Currency selection is required';
        }
        break;

      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Check if step is valid without setting errors (for button state)
  const isStepValid = () => {
    const step = currentStep;

    switch (step) {
      case 1:
        return validateRequired(formData.username) &&
               validateRequired(formData.email) && validateEmail(formData.email) &&
               validatePassword(formData.password) &&
               validateRequired(formData.firstName) &&
               validateRequired(formData.lastName) &&
               validateRequired(formData.phone) && validatePhone(formData.phone) &&
               validateRequired(formData.merchantGroup);
      case 2:
        return validateRequired(formData.companyName) &&
               validateRequired(formData.ssmNumber) &&
               validateRequired(formData.merchantType) &&
               (formData.merchantType !== 'Others' || validateRequired(formData.merchantTypeOther));
      case 3:
        return validateRequired(formData.addressLine1) &&
               validateRequired(formData.city) &&
               validateRequired(formData.postcode) &&
               validateRequired(formData.state) &&
               validateRequired(formData.country);
      case 4:
        return validateRequired(formData.walletAddress) &&
               (!formData.referralFees || validateNumber(formData.referralFees));
      case 5:
        return (!formData.markupFees || validateNumber(formData.markupFees)) &&
               (!formData.processingFees || validateNumber(formData.processingFees)) &&
               (!formData.L1Rebate || validateNumber(formData.L1Rebate)) &&
               (!formData.L2Rebate || validateNumber(formData.L2Rebate)) &&
               (!formData.T1Rebate || validateNumber(formData.T1Rebate)) &&
               (!formData.T2Rebate || validateNumber(formData.T2Rebate)) &&
               (!formData.MerchantRebate || validateNumber(formData.MerchantRebate)) &&
               (!formData.DirectRebate || validateNumber(formData.DirectRebate));
      case 6:
        return validateRequired(formData.currencies);
      default:
        return true;
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    const newStates = countriesAndStates[newCountry] || [];
    setFormData(prev => ({ 
      ...prev, 
      country: newCountry,
      state: newStates[0] || '' 
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
        // Clear errors when moving to next step
        setErrors({});
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Clear errors when going back
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalMerchantType = formData.merchantType === 'Others' ? formData.merchantTypeOther : formData.merchantType;
    onSubmit({ ...formData, merchantType: finalMerchantType });
    handleClose();
  };

  // Validate individual field
  const validateField = (field, value) => {
    const fieldErrors = { ...errors };

    switch (field) {
      case 'username':
        if (!validateRequired(value)) {
          fieldErrors.username = 'Username is required';
        } else {
          delete fieldErrors.username;
        }
        break;
      case 'email':
        if (!validateRequired(value)) {
          fieldErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          fieldErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
        } else {
          delete fieldErrors.email;
        }
        break;
      case 'password':
        if (!validateRequired(value)) {
          fieldErrors.password = 'Password is required';
        } else if (!validatePassword(value)) {
          fieldErrors.password = 'Password must be at least 6 characters long';
        } else {
          delete fieldErrors.password;
        }
        break;
      case 'firstName':
        if (!validateRequired(value)) {
          fieldErrors.firstName = 'First name is required';
        } else {
          delete fieldErrors.firstName;
        }
        break;
      case 'lastName':
        if (!validateRequired(value)) {
          fieldErrors.lastName = 'Last name is required';
        } else {
          delete fieldErrors.lastName;
        }
        break;
      case 'phone':
        if (!validateRequired(value)) {
          fieldErrors.phone = 'Phone number is required';
        } else if (!validatePhone(value)) {
          fieldErrors.phone = 'Please enter a valid phone number (at least 8 digits)';
        } else {
          delete fieldErrors.phone;
        }
        break;
      case 'companyName':
        if (!validateRequired(value)) {
          fieldErrors.companyName = 'Company name is required';
        } else {
          delete fieldErrors.companyName;
        }
        break;
      case 'ssmNumber':
        if (!validateRequired(value)) {
          fieldErrors.ssmNumber = 'SSM number is required';
        } else {
          delete fieldErrors.ssmNumber;
        }
        break;
      case 'merchantType':
        if (!validateRequired(value)) {
          fieldErrors.merchantType = 'Merchant type is required';
        } else {
          delete fieldErrors.merchantType;
        }
        break;
      case 'merchantTypeOther':
        if (formData.merchantType === 'Others' && !validateRequired(value)) {
          fieldErrors.merchantTypeOther = 'Please specify the merchant type';
        } else {
          delete fieldErrors.merchantTypeOther;
        }
        break;
      case 'merchantGroup':
        if (!validateRequired(value)) {
          fieldErrors.merchantGroup = 'Merchant group is required';
        } else {
          delete fieldErrors.merchantGroup;
        }
        break;
      case 'addressLine1':
        if (!validateRequired(value)) {
          fieldErrors.addressLine1 = 'Address line 1 is required';
        } else {
          delete fieldErrors.addressLine1;
        }
        break;
      case 'city':
        if (!validateRequired(value)) {
          fieldErrors.city = 'City is required';
        } else {
          delete fieldErrors.city;
        }
        break;
      case 'postcode':
        if (!validateRequired(value)) {
          fieldErrors.postcode = 'Postcode is required';
        } else {
          delete fieldErrors.postcode;
        }
        break;
      case 'state':
        if (!validateRequired(value)) {
          fieldErrors.state = 'State is required';
        } else {
          delete fieldErrors.state;
        }
        break;
      case 'country':
        if (!validateRequired(value)) {
          fieldErrors.country = 'Country is required';
        } else {
          delete fieldErrors.country;
        }
        break;
      case 'walletAddress':
        if (!validateRequired(value)) {
          fieldErrors.walletAddress = 'Wallet address is required';
        } else {
          delete fieldErrors.walletAddress;
        }
        break;
      case 'referralFees':
        if (value && !validateNumber(value)) {
          fieldErrors.referralFees = 'Please enter a valid number (e.g., 1.2)';
        } else {
          delete fieldErrors.referralFees;
        }
        break;
      case 'markupFees':
        if (value && !validateNumber(value)) {
          fieldErrors.markupFees = 'Please enter a valid number (e.g., 1.2)';
        } else {
          delete fieldErrors.markupFees;
        }
        break;
      case 'processingFees':
        if (value && !validateNumber(value)) {
          fieldErrors.processingFees = 'Please enter a valid number (e.g., 1.2)';
        } else {
          delete fieldErrors.processingFees;
        }
        break;
      case 'L1Rebate':
      case 'L2Rebate':
      case 'T1Rebate':
      case 'T2Rebate':
      case 'MerchantRebate':
      case 'DirectRebate':
        if (value && !validateNumber(value)) {
          fieldErrors[field] = 'Please enter a valid number (e.g., 1)';
        } else {
          delete fieldErrors[field];
        }
        break;
      case 'currencies':
        if (!validateRequired(value)) {
          fieldErrors.currencies = 'Currency selection is required';
        } else {
          delete fieldErrors.currencies;
        }
        break;
      default:
        break;
    }

    setErrors(fieldErrors);
  };

  // Filter numeric input - allow digits and optionally decimal point
  const filterNumericInput = (value, allowDecimal = false) => {
    if (allowDecimal) {
      // Allow digits and one decimal point
      return value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    } else {
      // Only allow digits (integers)
      return value.replace(/[^\d]/g, '');
    }
  };

  // Reusable field renderer with error display
  const renderField = (Component, label, field, props = {}) => {
    // Check if this is a numeric field that should filter input
    const isNumericField = ['L1Rebate', 'L2Rebate', 'T1Rebate', 'T2Rebate', 'MerchantRebate', 'DirectRebate', 
                            'markupFees', 'processingFees', 'referralFees'].includes(field);
    const allowDecimal = ['markupFees', 'processingFees', 'referralFees'].includes(field);
    
    // Remove type: 'number' from props if present
    const { type, ...restProps } = props;
    const finalProps = type === 'number' ? restProps : props;

    return (
      <div>
        <FormLabel label={label}>
          <Component
            value={formData[field]}
            onChange={(e) => {
              let value = e.target.value;
              
              // Filter numeric input in real-time
              if (isNumericField) {
                value = filterNumericInput(value, allowDecimal);
              }
              
              handleChange(field, value);
              // Validate field in real-time
              validateField(field, value);
            }}
            onBlur={(e) => {
              // Re-validate on blur to ensure error shows if user leaves field empty
              validateField(field, e.target.value);
            }}
            onKeyDown={(e) => {
              // Prevent non-numeric keys for numeric fields
              if (isNumericField) {
                // Allow: backspace, delete, tab, escape, enter, decimal point (if allowed)
                if (allowDecimal && e.key === '.') {
                  // Allow decimal point but prevent multiple
                  if (e.target.value.includes('.')) {
                    e.preventDefault();
                  }
                  return;
                }
                if (!['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                    !e.ctrlKey && !e.metaKey && !/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }
            }}
            className={errors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            {...finalProps}
          />
        </FormLabel>
        {errors[field] && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  // Render preview of all form data
  const renderPreview = () => {
    const previewSections = [
      {
        title: 'Basic Information',
        fields: [
          { label: 'Merchant Group', value: formData.merchantGroup },
          { label: 'Username', value: formData.username || 'N/A' },
          { label: 'Email', value: formData.email || 'N/A' },
          { label: 'Password', value: '••••••••' },
          { label: 'First Name', value: formData.firstName || 'N/A' },
          { label: 'Last Name', value: formData.lastName || 'N/A' },
          { label: 'Phone', value: formData.phone || 'N/A' },
        ]
      },
      {
        title: 'Business Information',
        fields: [
          { label: 'Company Name', value: formData.companyName || 'N/A' },
          { label: 'SSM Number', value: formData.ssmNumber || 'N/A' },
          { label: 'Merchant Type', value: formData.merchantType === 'Others' ? formData.merchantTypeOther : formData.merchantType || 'N/A' },
        ]
      },
      {
        title: 'Address',
        fields: [
          { label: 'Address Line 1', value: formData.addressLine1 || 'N/A' },
          { label: 'Address Line 2', value: formData.addressLine2 || 'N/A' },
          { label: 'City', value: formData.city || 'N/A' },
          { label: 'Postcode', value: formData.postcode || 'N/A' },
          { label: 'State', value: formData.state || 'N/A' },
          { label: 'Country', value: formData.country || 'N/A' },
        ]
      },
      {
        title: 'Wallet & Referral',
        fields: [
          { label: 'Wallet Address', value: formData.walletAddress || 'N/A' },
          { label: 'Referral By', value: formData.sponsorBy || 'N/A' },
          { label: 'Referral Fees', value: formData.referralFees || 'N/A' },
          { label: 'Remarks', value: formData.referralRemarks || 'N/A' },
        ]
      },
      {
        title: 'Fees & Rebates',
        fields: [
          { label: 'Markup Fees', value: formData.markupFees ? `${formData.markupFees}%` : 'N/A' },
          { label: 'Processing Fees', value: formData.processingFees ? `${formData.processingFees}%` : 'N/A' },
          { label: 'L1 Rebate', value: formData.L1Rebate || '0' },
          { label: 'L2 Rebate', value: formData.L2Rebate || '0' },
          { label: 'T1 Rebate', value: formData.T1Rebate || '0' },
          { label: 'T2 Rebate', value: formData.T2Rebate || '0' },
          { label: 'Merchant Rebate', value: formData.MerchantRebate || '0' },
          { label: 'Direct Rebate', value: formData.DirectRebate || '0' },
        ]
      },
      {
        title: 'Currency',
        fields: [
          { label: 'Currency', value: formData.currencies || 'N/A' },
        ]
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-black">Review Your Information</h3>
        </div>
        {previewSections.map((section, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-base text-black mb-3">{section.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.fields.map((field, fieldIdx) => (
                <div key={fieldIdx} className="flex flex-col">
                  <span className="text-sm text-gray-500">{field.label}</span>
                  <span className="text-base text-black font-medium">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <FormSection title="Basic Information">
            <div>
              <FormLabel label="Merchant's Group">
                <div className="flex gap-16 items-center">
                  {['T1', 'T2', 'T3'].map((group) => (
                    <label key={group} className="flex gap-2 items-center cursor-pointer">
                      <input
                        type="radio"
                        name="merchantGroup"
                        value={group}
                        checked={formData.merchantGroup === group}
                        onChange={(e) => {
                          handleChange('merchantGroup', e.target.value);
                          validateField('merchantGroup', e.target.value);
                        }}
                        className="peer sr-only"
                      />
                      <span className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        formData.merchantGroup === group ? 'border-black' : errors.merchantGroup ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        {formData.merchantGroup === group && <span className="size-2 rounded-full bg-black" />}
                      </span>
                      <span className="font-medium text-lg text-black">{group}</span>
                    </label>
                  ))}
                </div>
              </FormLabel>
              {errors.merchantGroup && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.merchantGroup}
                </p>
              )}
            </div>
            {renderField(TextInput, 'Username', 'username', { placeholder: 'Insert username here' })}
            {renderField(TextInput, 'Email', 'email', { placeholder: 'Insert email here', type: 'email' })}
            {renderField(PasswordInput, 'Password', 'password', { placeholder: 'Insert password here' })}
            {renderField(TextInput, 'First Name', 'firstName', { placeholder: 'Insert first name here' })}
            {renderField(TextInput, 'Last Name', 'lastName', { placeholder: 'Insert last name here' })}
            {renderField(TextInput, 'Phone', 'phone', { placeholder: 'Insert phone number here', type: 'tel' })}
          </FormSection>
        );

      case 2: // Business Info
        return (
          <FormSection title="Business Information">
            {renderField(TextInput, 'Company Name', 'companyName', { placeholder: 'Insert company name here' })}
            {renderField(TextInput, 'SSM Number', 'ssmNumber', { placeholder: 'Insert SSM number here' })}
            <div>
              <FormLabel label="Merchant's Type">
                <SelectInput 
                  value={formData.merchantType} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, merchantType: value, merchantTypeOther: '' }));
                    validateField('merchantType', value);
                    // Clear merchantTypeOther error if merchant type is not "Others"
                    if (value !== 'Others' && errors.merchantTypeOther) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.merchantTypeOther;
                        return newErrors;
                      });
                    }
                  }}
                  onBlur={(e) => {
                    validateField('merchantType', e.target.value);
                  }}
                  className={errors.merchantType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  options={merchantTypes} 
                  placeholder="Select type of business" 
                />
              </FormLabel>
              {errors.merchantType && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.merchantType}
                </p>
              )}
            </div>
            {formData.merchantType === 'Others' && renderField(TextInput, 'Specify Merchant Type', 'merchantTypeOther', { placeholder: 'Please specify the merchant type' })}
          </FormSection>
        );

      case 3: // Address
        return (
          <FormSection title="Business Address">
            {renderField(TextInput, 'Address Line 1', 'addressLine1', { placeholder: 'Insert address line 1 here' })}
            {renderField(TextInput, 'Address Line 2', 'addressLine2', { placeholder: 'Insert address line 2 here' })}
            {renderField(TextInput, 'City', 'city', { placeholder: 'Insert city name here' })}
            {renderField(TextInput, 'Postcode', 'postcode', { placeholder: 'Insert postcode here' })}
            <div>
              <FormLabel label="State">
                <SelectInput 
                  value={formData.state} 
                  onChange={(e) => {
                    handleChange('state', e.target.value);
                    validateField('state', e.target.value);
                  }}
                  onBlur={(e) => {
                    validateField('state', e.target.value);
                  }}
                  className={errors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  options={availableStates} 
                  placeholder="Select State" 
                />
              </FormLabel>
              {errors.state && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.state}
                </p>
              )}
            </div>
            <div>
              <FormLabel label="Country">
                <SelectInput 
                  value={formData.country} 
                  onChange={(e) => {
                    handleCountryChange(e);
                    validateField('country', e.target.value);
                  }}
                  onBlur={(e) => {
                    validateField('country', e.target.value);
                  }}
                  className={errors.country ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  options={countries} 
                  placeholder="Select Country" 
                />
              </FormLabel>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.country}
                </p>
              )}
            </div>
          </FormSection>
        );

      case 4: // Wallet & Referral
        return (
          <>
            <FormSection title="Wallet Setup">
              {renderField(TextInput, 'Wallet Address', 'walletAddress', { placeholder: 'Insert wallet address here' })}
            </FormSection>
            <FormSection title="Referral Setup">
              {renderField(TextInput, 'Referral By', 'referralBy', { placeholder: 'Insert referral ID here' })}
              {renderField(TextInput, 'Referral Fees', 'referralFees', { placeholder: 'eg:1.2' })}
              {renderField(TextInput, 'Remarks', 'referralRemarks', { placeholder: 'Additional remarks' })}
            </FormSection>
          </>
        );

      case 5: // Fees & Rebates
        return (
          <>
            <FormSection title="Fees Setup">
              {renderField(TextInputWithSuffix, 'Markup Fees (%)', 'markupFees', { placeholder: 'eg: 1.2', suffix: '%' })}
              {renderField(TextInputWithSuffix, 'Processing Fees (%)', 'processingFees', { placeholder: 'eg: 1.2', suffix: '%' })}
            </FormSection>
            <FormSection title="Rebates Setup">
              {renderField(TextInput, 'L1 Rebate', 'L1Rebate', { placeholder: 'eg: 1' })}
              {renderField(TextInput, 'L2 Rebate', 'L2Rebate', { placeholder: 'eg: 1' })}
              {renderField(TextInput, 'T1 Rebate', 'T1Rebate', { placeholder: 'eg: 1' })}
              {renderField(TextInput, 'T2 Rebate', 'T2Rebate', { placeholder: 'eg: 1' })}
              {renderField(TextInput, 'Merchant Rebate', 'MerchantRebate', { placeholder: 'eg: 1' })}
              {renderField(TextInput, 'Direct Rebate', 'DirectRebate', { placeholder: 'eg: 1' })}
            </FormSection>
          </>
        );

      case 6: // Currency & Preview
        return (
          <>
            <FormSection title="Currencies Select">
              <div>
                <FormLabel label="Currencies">
                  <SelectInput 
                    value={formData.currencies} 
                    onChange={(e) => {
                      handleChange('currencies', e.target.value);
                      validateField('currencies', e.target.value);
                    }}
                    onBlur={(e) => {
                      validateField('currencies', e.target.value);
                    }}
                    className={errors.currencies ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    options={CURRENCY_OPTIONS} 
                    placeholder="Select Currencies" 
                  />
                </FormLabel>
                {errors.currencies && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.currencies}
                  </p>
                )}
              </div>
            </FormSection>
            {renderPreview()}
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[10px] w-full max-w-[860px] max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
          <h2 className="font-semibold text-2xl text-black">Add New Merchant</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={32} className="text-[#868e8d]" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          {/* Circles and connecting lines row */}
          <div className="flex items-center w-full mb-1.5 sm:mb-2">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <>
                  {/* Step circle */}
                  <div key={step.id} className="flex-shrink-0 relative z-10">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-colors text-sm sm:text-base ${
                      isActive
                        ? 'bg-black text-white' 
                        : isCompleted
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : step.id}
                    </div>
                  </div>
                  
                  {/* Connecting line - between circles */}
                  {index < STEPS.length - 1 && (
                    <div key={`line-${step.id}`} className="flex-1 flex-shrink-0 mx-1 sm:mx-2" style={{ minWidth: '8px' }}>
                      <div 
                        className={`w-full h-0.5 transition-colors ${
                          isCompleted ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </>
              );
            })}
          </div>
          
          {/* Labels row - positioned below circles */}
          <div className="flex items-start w-full">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <>
                  <div key={`label-${step.id}`} className="flex-1 flex flex-col items-center" style={{ minWidth: 0 }}>
                    <span className={`text-[10px] sm:text-xs text-center w-full px-0.5 sm:px-0 leading-tight break-words ${
                      isActive || isCompleted ? 'text-black font-medium' : 'text-gray-400'
                    }`}>
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">{step.label.split(' ')[0]}</span>
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div key={`spacer-${step.id}`} className="flex-1 flex-shrink-0 mx-1 sm:mx-2" style={{ minWidth: '8px' }} />
                  )}
                </>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 px-6">
          <div className="flex flex-col gap-6">
            {renderStepContent()}
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="flex gap-4 justify-between py-4 px-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="border border-[#a1abaa] p-3 rounded-md font-semibold text-lg text-black hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="border border-[#a1abaa] p-3 rounded-md font-semibold text-lg text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
            )}
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`p-3 rounded-md font-semibold text-lg text-white transition-colors flex items-center gap-2 ${
                  isStepValid() 
                    ? 'bg-black hover:bg-gray-800 cursor-pointer' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-black p-3 rounded-md font-semibold text-lg text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <Plus size={24} />
                Create Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
