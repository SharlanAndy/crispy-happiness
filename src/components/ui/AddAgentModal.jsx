import { useState, useEffect } from 'react';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { FormLabel, FormSection, TextInput, PasswordInput, SelectInput } from '../form';
import { api } from '@/lib/api';

const INITIAL_AGENT_DATA = {
  username: '',
  email: '',
  password: '',
  agent_type: '',
  upline_by: '',
  first_name: '',
  last_name: '',
  phone: '',
  wallet_address: ''
};

const AGENT_TYPE_OPTIONS = [
  { value: 't1', label: 'T1' },
  { value: 't2', label: 'T2' }
];

export default function AddAgentModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_AGENT_DATA);
  const [uplineOptions, setUplineOptions] = useState([]);
  const [loadingUpline, setLoadingUpline] = useState(false);
  const [isTypeSectionCollapsed, setIsTypeSectionCollapsed] = useState(false);

  // Auto-collapse when both agent_type and upline_by are selected
  useEffect(() => {
    const needsUpline = formData.agent_type === 't1' || formData.agent_type === 't2';
    const isComplete = formData.agent_type && (!needsUpline || formData.upline_by);
    if (isComplete) {
      setIsTypeSectionCollapsed(true);
    }
  }, [formData.agent_type, formData.upline_by]);

  const handleChange = (field, value) => {
    // When agent_type changes, reset upline and fetch appropriate dropdown
    if (field === 'agent_type') {
      setFormData(prev => ({ ...prev, [field]: value, upline_by: '' })); // Reset upline when type changes
      fetchUplineOptions(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Fetch upline options based on agent type
  const fetchUplineOptions = async (agentType) => {
    if (!agentType) {
      setUplineOptions([]);
      return;
    }

    setLoadingUpline(true);
    try {
      let result = null;
      if (agentType === 't1') {
        // Fetch shareholders for T1
        result = await api.systemadmin.getShareholdersDropdown();
      } else if (agentType === 't2') {
        // Fetch T1 agents for T2
        result = await api.systemadmin.getT1AgentsDropdown();
      }

      if (result && result.success && result.data) {
        // Transform data to dropdown options format
        // API returns: { id, display_name, referral_id, username }
        // Use id for value (upline_by), display_name for label
        const options = result.data.map(item => ({
          value: item.id?.toString() || item.ID?.toString(),
          label: item.display_name || item.username || `ID: ${item.id || item.ID}`
        }));
        setUplineOptions(options);
      } else {
        setUplineOptions([]);
      }
    } catch (error) {
      console.error('Failed to fetch upline options:', error);
      setUplineOptions([]);
    } finally {
      setLoadingUpline(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_AGENT_DATA);
    setUplineOptions([]);
    setIsTypeSectionCollapsed(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  // Get selected upline display name
  const getSelectedUplineName = () => {
    if (!formData.upline_by) return null;
    const selectedOption = uplineOptions.find(opt => opt.value === formData.upline_by);
    return selectedOption?.label || null;
  };

  // Reusable field renderer
  const renderField = (Component, label, field, props = {}) => {
    return (
      <FormLabel label={label}>
        <Component
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          {...props}
        />
      </FormLabel>
    );
  };

  if (!isOpen) return null;

  const selectedUplineName = getSelectedUplineName();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="flex items-center justify-between py-2.5 px-4 border-b">
          <h2 className="font-semibold text-xl text-black">Add New Agent</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-[#868e8d]" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="py-3 px-4 overflow-y-auto flex-1">
          <div className="flex flex-col gap-3">
            {/* Agent Type and Upline - At the top, collapsible */}
            <div className="border rounded-lg">
              <button
                type="button"
                onClick={() => setIsTypeSectionCollapsed(!isTypeSectionCollapsed)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Agent Type & Upline</span>
                  {formData.agent_type && (
                    <span className="text-xs text-gray-500">
                      ({AGENT_TYPE_OPTIONS.find(opt => opt.value === formData.agent_type)?.label || formData.agent_type.toUpperCase()}
                      {selectedUplineName && ` • ${selectedUplineName}`})
                    </span>
                  )}
                </div>
                {isTypeSectionCollapsed ? (
                  <ChevronDown size={18} className="text-gray-500" />
                ) : (
                  <ChevronUp size={18} className="text-gray-500" />
                )}
              </button>
              
              {!isTypeSectionCollapsed && (
                <div className="px-3 pb-3 space-y-3">
                  <FormLabel label="Agent Type">
                    <SelectInput
                      value={formData.agent_type}
                      onChange={(e) => handleChange('agent_type', e.target.value)}
                      options={AGENT_TYPE_OPTIONS}
                      placeholder="Select agent type"
                      required
                    />
                  </FormLabel>
                  
                  {/* Upline selection - shown for T1 and T2 */}
                  {(formData.agent_type === 't1' || formData.agent_type === 't2') && (
                    <FormLabel label={formData.agent_type === 't1' ? 'Select Shareholder Upline' : 'Select T1 Agent Upline'}>
                      <SelectInput
                        value={formData.upline_by}
                        onChange={(e) => handleChange('upline_by', e.target.value)}
                        options={uplineOptions}
                        placeholder={loadingUpline ? 'Loading...' : formData.agent_type === 't1' ? 'Select shareholder upline' : 'Select T1 agent upline'}
                        required
                        disabled={loadingUpline || uplineOptions.length === 0}
                      />
                    </FormLabel>
                  )}
                </div>
              )}
            </div>

            {/* Agent's Information */}
            <FormSection title="Agent's Information">
              <div className="grid grid-cols-2 gap-3">
                {renderField(TextInput, 'Username', 'username', { placeholder: 'Enter username', required: true })}
                {renderField(TextInput, 'Email Address', 'email', { placeholder: 'agent@example.com', type: 'email', required: true })}
              </div>
              {renderField(PasswordInput, 'Password', 'password', { placeholder: 'Insert password here', required: true })}
            </FormSection>

            {/* Personal Information */}
            <FormSection title="Personal Information">
              <div className="grid grid-cols-2 gap-3">
                {renderField(TextInput, 'First Name', 'first_name', { placeholder: 'Enter first name', required: true })}
                {renderField(TextInput, 'Last Name', 'last_name', { placeholder: 'Enter last name', required: true })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {renderField(TextInput, 'Phone', 'phone', { placeholder: 'Enter phone number (optional)', type: 'tel' })}
                {renderField(TextInput, 'Wallet Address', 'wallet_address', { placeholder: 'Enter wallet address (optional)' })}
              </div>
            </FormSection>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="flex gap-3 justify-end py-2.5 px-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="border border-[#a1abaa] px-4 py-2 rounded-md font-semibold text-sm text-black hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-black px-4 py-2 rounded-md font-semibold text-sm text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
