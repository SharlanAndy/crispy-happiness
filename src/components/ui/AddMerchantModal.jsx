import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FormLabel, FormSection, TextInput, TextInputWithSuffix, PasswordInput, SelectInput } from '../form';
import merchantTypes from '../../constant/merchantTypes.json';
import countriesAndStates from '../../constant/countriesAndStates.json';

const INITIAL_FORM_DATA = {
  merchantGroup: 'T1',
  email: '',
  password: '',
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
  currencies: '🇲🇾 Malaysia - RM',
};

const CURRENCY_OPTIONS = ['🇲🇾 Malaysia - RM', '🇸🇬 Singapore - SGD', '🇺🇸 USA - USD'];

export default function AddMerchantModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const countries = Object.keys(countriesAndStates);
  const availableStates = countriesAndStates[formData.country] || [];

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

  const resetForm = () => setFormData(INITIAL_FORM_DATA);

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalMerchantType = formData.merchantType === 'Others' ? formData.merchantTypeOther : formData.merchantType;
    onSubmit({ ...formData, merchantType: finalMerchantType });
    handleClose();
  };

  // Reusable field renderer
  const renderField = (Component, label, field, props = {}) => (
    <FormLabel label={label}>
      <Component
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        {...props}
      />
    </FormLabel>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[10px] w-full max-w-[860px] max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between py-4 px-6">
          <h2 className="font-semibold text-2xl text-black">Add New Merchant</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={32} className="text-[#868e8d]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 px-6">
          <div className="flex flex-col gap-6">
            {/* Merchant's Information */}
            <FormSection title="Merchant's Information">
              <FormLabel label="Merchant's Group">
                <div className="flex gap-16 items-center">
                  {['T1', 'T2', 'T3'].map((group) => (
                    <label key={group} className="flex gap-2 items-center cursor-pointer">
                      <input
                        type="radio"
                        name="merchantGroup"
                        value={group}
                        checked={formData.merchantGroup === group}
                        onChange={(e) => handleChange('merchantGroup', e.target.value)}
                        className="peer sr-only"
                      />
                      <span className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        formData.merchantGroup === group ? 'border-black' : 'border-gray-300'
                      }`}>
                        {formData.merchantGroup === group && <span className="size-2 rounded-full bg-black" />}
                      </span>
                      <span className="font-medium text-lg text-black">{group}</span>
                    </label>
                  ))}
                </div>
              </FormLabel>
              {renderField(TextInput, 'Email', 'email', { placeholder: 'Insert email here', type: 'email' })}
              {renderField(PasswordInput, 'Password', 'password', { placeholder: 'Insert password here' })}
              {renderField(TextInput, 'Company Name', 'companyName', { placeholder: 'Insert company name here' })}
              {renderField(TextInput, 'SSM Number', 'ssmNumber', { placeholder: 'Insert SSM number here' })}
              <FormLabel label="Merchant's Type">
                <SelectInput 
                  value={formData.merchantType} 
                  onChange={(e) => setFormData(prev => ({ ...prev, merchantType: e.target.value, merchantTypeOther: '' }))} 
                  options={merchantTypes} 
                  placeholder="Select type of business" 
                />
              </FormLabel>
              {formData.merchantType === 'Others' && renderField(TextInput, 'Specify Merchant Type', 'merchantTypeOther', { placeholder: 'Please specify the merchant type' })}
            </FormSection>

            {/* Business Address */}
            <FormSection title="Business Address">
              {renderField(TextInput, 'Address Line 1', 'addressLine1', { placeholder: 'Insert address line 1 here' })}
              {renderField(TextInput, 'Address Line 2', 'addressLine2', { placeholder: 'Insert address line 2 here' })}
              {renderField(TextInput, 'City', 'city', { placeholder: 'Insert city name here' })}
              {renderField(TextInput, 'Postcode', 'postcode', { placeholder: 'Insert postcode here' })}
              {renderField(SelectInput, 'State', 'state', { options: availableStates, placeholder: 'Select State' })}
              <FormLabel label="Country">
                <SelectInput value={formData.country} onChange={handleCountryChange} options={countries} placeholder="Select Country" />
              </FormLabel>
            </FormSection>

            {/* Wallet Setup */}
            <FormSection title="Wallet Setup">
              {renderField(TextInput, 'Wallet Address', 'walletAddress', { placeholder: 'Insert wallet address here' })}
            </FormSection>

            {/* Referral Setup */}
            <FormSection title="Referral Setup">
              {renderField(TextInput, 'Referral By', 'referralBy', { placeholder: 'Insert referral ID here' })}
              {renderField(TextInput, 'Referral Fees', 'referralFees', { placeholder: 'eg:1.2' })}
              {renderField(TextInput, 'Remarks', 'referralRemarks', { placeholder: 'Additional remarks' })}
            </FormSection>

            {/* Fees Setup */}
            <FormSection title="Fees Setup">
              {renderField(TextInputWithSuffix, 'Markup Fees (%)', 'markupFees', { placeholder: 'eg: 1.2', suffix: '%' })}
              {renderField(TextInputWithSuffix, 'Processing Fees (%)', 'processingFees', { placeholder: 'eg: 1.2', suffix: '%' })}
            </FormSection>

            {/* Currencies Select */}
            <FormSection title="Currencies Select">
              {renderField(SelectInput, 'Currencies', 'currencies', { options: CURRENCY_OPTIONS, placeholder: 'Select Currencies' })}
            </FormSection>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="flex gap-4 justify-end py-4 px-6">
          <button
            type="button"
            onClick={handleClose}
            className="border border-[#a1abaa] p-3 rounded-md font-semibold text-lg text-black hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-black p-3 rounded-md font-semibold text-lg text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
          >
            <Plus size={24} />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
