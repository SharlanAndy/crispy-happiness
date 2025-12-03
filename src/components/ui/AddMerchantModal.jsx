import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FormLabel, FormSection, TextInput, TextInputWithSuffix, PasswordInput, SelectInput } from '../form';
import merchantTypes from '../../constant/merchantTypes.json';
import countriesAndStates from '../../constant/countriesAndStates.json';

export default function AddMerchantModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
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
  });

  // Get available countries
  const countries = Object.keys(countriesAndStates);
  
  // Get states for selected country
  const availableStates = countriesAndStates[formData.country] || [];

  // Handle country change - reset state to first available state
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
    setFormData({
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
    });
  };

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
                        onChange={(e) => setFormData(prev => ({ ...prev, merchantGroup: e.target.value }))}
                        className="peer sr-only"
                      />
                      <span className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        formData.merchantGroup === group 
                          ? 'border-black' 
                          : 'border-gray-300'
                      }`}>
                        {formData.merchantGroup === group && (
                          <span className="size-2 rounded-full bg-black" />
                        )}
                      </span>
                      <span className="font-medium text-lg text-black">{group}</span>
                    </label>
                  ))}
                </div>
              </FormLabel>
              <FormLabel label="Email">
                <TextInput placeholder="Insert email here" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} type="email" />
              </FormLabel>
              <FormLabel label="Password">
                <PasswordInput placeholder="Insert password here" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} />
              </FormLabel>
              <FormLabel label="Company Name">
                <TextInput placeholder="Insert company name here" value={formData.companyName} onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} />
              </FormLabel>
              <FormLabel label="SSM Number">
                <TextInput placeholder="Insert SSM number here" value={formData.ssmNumber} onChange={(e) => setFormData(prev => ({ ...prev, ssmNumber: e.target.value }))} />
              </FormLabel>
              <FormLabel label="Merchant's Type">
                <SelectInput 
                  value={formData.merchantType} 
                  onChange={(e) => setFormData(prev => ({ ...prev, merchantType: e.target.value, merchantTypeOther: '' }))} 
                  options={merchantTypes} 
                  placeholder="Select type of business" 
                />
              </FormLabel>
              {formData.merchantType === 'Others' && (
                <FormLabel label="Specify Merchant Type">
                  <TextInput 
                    placeholder="Please specify the merchant type" 
                    value={formData.merchantTypeOther} 
                    onChange={(e) => setFormData(prev => ({ ...prev, merchantTypeOther: e.target.value }))} 
                  />
                </FormLabel>
              )}
            </FormSection>

            <FormSection title="Business Address">
              <FormLabel label="Address Line 1">
                <TextInput placeholder="Insert address line 1 here" value={formData.addressLine1} onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))} />
              </FormLabel>
              <FormLabel label="Address Line 2">
                <TextInput placeholder="Insert address line 2 here" value={formData.addressLine2} onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))} />
              </FormLabel>
              <FormLabel label="City">
                <TextInput placeholder="Insert city name here" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} />
              </FormLabel>
              <FormLabel label="Postcode">
                <TextInput placeholder="Insert postcode here" value={formData.postcode} onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))} />
              </FormLabel>
              <FormLabel label="State">
                <SelectInput 
                  value={formData.state} 
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} 
                  options={availableStates} 
                  placeholder="Select State" 
                />
              </FormLabel>
              <FormLabel label="Country">
                <SelectInput 
                  value={formData.country} 
                  onChange={handleCountryChange} 
                  options={countries} 
                  placeholder="Select Country" 
                />
              </FormLabel>
            </FormSection>

            <FormSection title="Wallet Setup">
              <FormLabel label="Wallet Address">
                <TextInput placeholder="Insert wallet address here" value={formData.walletAddress} onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))} />
              </FormLabel>
            </FormSection>

            <FormSection title="Sponsor Setup">
              <FormLabel label="Sponsor By">
                <TextInput placeholder="Insert referral ID here" value={formData.sponsorBy} onChange={(e) => setFormData(prev => ({ ...prev, sponsorBy: e.target.value }))} />
              </FormLabel>
              <FormLabel label="Fees">
                <TextInput placeholder="eg:1.2" value={formData.fees} onChange={(e) => setFormData(prev => ({ ...prev, fees: e.target.value }))} />
              </FormLabel>
            </FormSection>

            <FormSection title="Fees Setup">
              <FormLabel label="Markup Fees (%)">
                <TextInputWithSuffix placeholder="eg: 1.2" value={formData.markupFees} onChange={(e) => setFormData(prev => ({ ...prev, markupFees: e.target.value }))} suffix="%" />
              </FormLabel>
              <FormLabel label="Processing Fees (%)">
                <TextInputWithSuffix placeholder="eg: 1.2" value={formData.processingFees} onChange={(e) => setFormData(prev => ({ ...prev, processingFees: e.target.value }))} suffix="%" />
              </FormLabel>
            </FormSection>

            <FormSection title="Currencies Select">
              <FormLabel label="Currencies">
                <SelectInput value={formData.currencies} onChange={(e) => setFormData(prev => ({ ...prev, currencies: e.target.value }))} options={['🇲🇾 Malaysia - RM', '🇸🇬 Singapore - SGD', '🇺🇸 USA - USD']} placeholder="Select Currencies" />
              </FormLabel>
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
