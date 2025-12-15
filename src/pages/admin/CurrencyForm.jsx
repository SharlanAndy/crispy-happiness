import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import { PageHeader, Card, Button, FormField } from '../../components/ui';
import { TextInput } from '../../components/form';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const COUNTRIES = [
  { value: 'MY', label: 'Malaysia - RM', flag: '🇲🇾', code: 'RM' },
  { value: 'SG', label: 'Singapore - SGD', flag: '🇸🇬', code: 'SGD' },
  { value: 'ID', label: 'Indonesia - IDR', flag: '🇮🇩', code: 'IDR' },
  { value: 'VN', label: 'Vietnam - VND', flag: '🇻🇳', code: 'VND' },
  { value: 'TH', label: 'Thailand - THB', flag: '🇹🇭', code: 'THB' },
  { value: 'PH', label: 'Philippines - PHP', flag: '🇵🇭', code: 'PHP' },
  { value: 'BN', label: 'Brunei - BND', flag: '🇧🇳', code: 'BND' },
  { value: 'OTHER', label: 'Other', flag: '🌐', code: '' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function CurrencyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleApiResponse, showError } = useToast();
  
  const isEditMode = id && id !== 'add';
  const isViewMode = location.pathname.includes('/view');
  
  const [formData, setFormData] = useState({
    country: '',
    rate: '',
    status: 'active',
    updatedAt: '',
    countryLabel: '',
    otherCountryLabel: '',
  });

  // Fetch currency details for view/edit
  useEffect(() => {
    const fetchCurrency = async () => {
      if (!isEditMode && !isViewMode) return;
      try {
        const result = await api.systemadmin.getCurrencySettings(id);
        if (result && result.success && result.data) {
          const data = result.data;
          // Try to match against predefined countries
          const matchedCountry = COUNTRIES.find(
            (c) =>
              c.label === data.currency_name ||
              c.code === data.currency_code ||
              c.value === data.country_name
          );

          if (matchedCountry) {
            // Known country from list
            setFormData({
              country: matchedCountry.value,
              rate: data.rate != null ? String(data.rate) : '',
              status: (data.status || 'active').toLowerCase(),
              updatedAt: data.updated_at
                ? new Date(data.updated_at).toLocaleString('en-GB')
                : '',
              countryLabel: matchedCountry.label,
              otherCountryLabel: '',
            });
          } else {
            // Country not in list – treat as "Other" and store label separately
            const fallbackLabel =
              data.currency_name ||
              [data.country_name, data.currency_code].filter(Boolean).join(' - ');

            setFormData({
              country: 'OTHER',
              rate: data.rate != null ? String(data.rate) : '',
              status: (data.status || 'active').toLowerCase(),
              updatedAt: data.updated_at
                ? new Date(data.updated_at).toLocaleString('en-GB')
                : '',
              countryLabel: 'Other',
              otherCountryLabel: fallbackLabel || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch currency settings:', error);
        showError(error?.message || 'Failed to fetch currency details. Please try again.');
      }
    };

    fetchCurrency();
  }, [id, isEditMode, isViewMode, showError]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        // Update existing currency: only rate and status are allowed to change
        const payload = {
          rate: Number(formData.rate),
          status: formData.status || 'active',
        };

        const result = await api.systemadmin.updateCurrency(id, payload);

        handleApiResponse(result, {
          successMessage: result?.message || 'Currency updated successfully!',
          errorMessage: result?.message || 'Failed to update currency. Please try again.',
        });

        if (result && result.success) {
          navigate('/system-admin/currency');
        }
        return;
      }

      const selected = COUNTRIES.find((c) => c.value === formData.country);

      let country_name = '';
      let currency_code = '';
      let currency_name = '';

      if (formData.country === 'OTHER') {
        const custom = (formData.otherCountryLabel || '').trim();
        country_name = custom;
        currency_name = custom;
        currency_code = custom;
      } else {
        country_name = selected?.label?.split(' - ')[0] || '';
        currency_code = selected?.code || '';
        currency_name = selected?.label || '';
      }

      const payload = {
        country_name,
        currency_code,
        currency_name,
        rate: Number(formData.rate),
        status: formData.status || 'active',
      };

      const result = await api.systemadmin.createCurrency(payload);

      handleApiResponse(result, {
        successMessage: result?.message || 'Currency created successfully!',
        errorMessage: result?.message || 'Failed to create currency. Please try again.',
      });

      if (result && result.success) {
        navigate('/system-admin/currency');
      }
    } catch (error) {
      console.error('Failed to submit currency:', error);
      showError(error?.message || 'Failed to submit currency. Please try again.');
    }
  };

  const selectedCountry = COUNTRIES.find((c) => c.value === formData.country);

  const getPageTitle = () => {
    if (isViewMode) return 'Currencies Details';
    if (isEditMode) return 'Currencies Details';
    return 'Add New Currencies';
  };

  const getPageDescription = () => {
    if (isViewMode) return 'View currencies details';
    if (isEditMode) return 'View or edit currencies details';
    return 'Add new currencies to your platform';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={getPageTitle()}
        description={getPageDescription()}
      />

      <form onSubmit={handleSubmit} className="space-y-6 w-1/2">
        <Card title="Currencies Setting">
          <div className="space-y-6">
            <FormField label="Country & Currencies">
              {isEditMode || isViewMode ? (
                formData.country === 'OTHER' ? (
                  <div className="space-y-2">
                    {/* Show 'Other' as main field (read-only) */}
                    <div className="bg-[#f3f3f5] text-[#1C1B1F] p-3 rounded-md cursor-not-allowed">
                      Other
                    </div>
                    {/* Show actual country/currency label as read-only text */}
                    <div className="bg-[#f3f3f5] text-[#1C1B1F] p-3 rounded-md cursor-not-allowed">
                      {formData.otherCountryLabel || '-'}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#f3f3f5] text-[#1C1B1F] p-3 rounded-md cursor-not-allowed">
                    {selectedCountry && (
                      <>
                        <span className="text-xl mr-2">{selectedCountry.flag}</span>
                        {selectedCountry.label}
                      </>
                    )}
                  </div>
                )
              ) : (
                <>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="flex items-center gap-2 bg-[#f3f3f5] rounded-md p-3 text-sm text-[#1C1B1F] placeholder:text-[#868e8d] w-full pr-10 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                      required
                      disabled={isViewMode}
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.flag} {country.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={20}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                    />
                  </div>

                  {!isEditMode && !isViewMode && formData.country === 'OTHER' && (
                    <div className="mt-3">
                      <TextInput
                        value={formData.otherCountryLabel}
                        onChange={(e) =>
                          handleChange('otherCountryLabel', e.target.value)
                        }
                        placeholder="Enter country & currency name"
                        className="bg-[#f3f3f5] text-[#1C1B1F]"
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </FormField>

            <FormField label="Rate">
              <div className="flex items-center gap-4">
                <TextInput
                  type="text"
                  value={formData.rate}
                  onChange={(e) => {
                    // Allow digits only
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    handleChange('rate', digitsOnly);
                  }}
                  placeholder="eg: 4"
                  className="bg-[#f3f3f5] text-[#1C1B1F]"
                  required
                  disabled={isViewMode}
                />
                <span className="text-lg font-medium">:</span>
                <div className="bg-[#f3f3f5] px-4 py-3 rounded-md font-medium text-md text-black placeholder:text-[#a1abaa] outline-none w-full cursor-not-allowed">
                  1 USD
                </div>
              </div>
            </FormField>

            {/* Status is selectable for both create and edit; read-only in view mode */}
            <FormField label="Status">
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="flex items-center gap-2 bg-[#f3f3f5] rounded-md p-3 text-sm text-[#1C1B1F] placeholder:text-[#868e8d] w-full pr-10 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={isViewMode}
                  required
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                />
              </div>
            </FormField>

            {/* Update time is only relevant when viewing/editing an existing currency */}
            {(isEditMode || isViewMode) && (
              <FormField label="Update Time">
                <div className="bg-[#f3f3f5] text-[#1C1B1F] p-3 rounded-md cursor-not-allowed">
                  {formData.updatedAt}
                </div>
              </FormField>
            )}
          </div>
        </Card>

        {!isViewMode && (
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/system-admin/currency')}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? (
                'Save Update'
              ) : (
                <>
                  <Plus size={18} />
                  Add Currencies
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
