import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import { PageHeader, Card, Button, FormField } from '../../components/ui';
import { TextInput } from '../../components/form';

const COUNTRIES = [
  { value: 'MY', label: 'Malaysia - RM', flag: '🇲🇾', code: 'RM' },
  { value: 'SG', label: 'Singapore - SGD', flag: '🇸🇬', code: 'SGD' },
  { value: 'ID', label: 'Indonesia - IDR', flag: '🇮🇩', code: 'IDR' },
  { value: 'VN', label: 'Vietnam - VND', flag: '🇻🇳', code: 'VND' },
  { value: 'TH', label: 'Thailand - THB', flag: '🇹🇭', code: 'THB' },
  { value: 'PH', label: 'Philippines - PHP', flag: '🇵🇭', code: 'PHP' },
  { value: 'BN', label: 'Brunei - BND', flag: '🇧🇳', code: 'BND' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function CurrencyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = id && id !== 'add';
  const isViewMode = location.pathname.includes('/view');
  
  const [formData, setFormData] = useState({
    country: '',
    rate: '',
    status: 'active',
    updatedAt: '',
  });

  useEffect(() => {
    if (isEditMode || isViewMode) {
      // Mock data - replace with actual API call
      setFormData({
        country: 'MY',
        rate: '4.2',
        status: 'active',
        updatedAt: '12-11-2025',
      });
    }
  }, [id, isEditMode, isViewMode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit:', formData);
    navigate('/system-admin/currency');
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
                <div className="bg-[#f3f3f5] text-[#1C1B1F] p-3 rounded-md cursor-not-allowed">
                  {selectedCountry && (
                    <>
                      <span className="text-xl mr-2">{selectedCountry.flag}</span>
                      {selectedCountry.label}
                    </>
                  )}
                </div>
              ) : (
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
              )}
            </FormField>

            <FormField label="Rate">
              <div className="flex items-center gap-4">
                <TextInput
                  type="number"
                  value={formData.rate}
                  onChange={(e) => handleChange('rate', e.target.value)}
                  placeholder="eg: 4.5"
                  step="0.01"
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

            {(isEditMode || isViewMode) && (
              <>
                <FormField label="Status">
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="flex items-center gap-2 bg-[#f3f3f5] rounded-md p-3 text-sm text-[#1C1B1F] placeholder:text-[#868e8d] w-full pr-10 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={isViewMode}
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

                <FormField label="Update Time">
                  <div className="bg-[#f3f3f5] text-[#1C1B1F] p-3 rounded-md cursor-not-allowed">
                    {formData.updatedAt}
                  </div>
                </FormField>
              </>
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
