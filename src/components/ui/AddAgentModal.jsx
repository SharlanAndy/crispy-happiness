import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FormLabel, FormSection, TextInput, PasswordInput, SelectInput } from '../form';

const INITIAL_AGENT_DATA = {
  username: '',
  email: '',
  password: '',
  agent_type: ''
};

const AGENT_TYPE_OPTIONS = [
  { value: 't1', label: 'T1' },
  { value: 't2', label: 'T2' }
];

export default function AddAgentModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_AGENT_DATA);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => setFormData(INITIAL_AGENT_DATA);

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[10px] w-full max-w-[860px] max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between py-4 px-6">
          <h2 className="font-semibold text-2xl text-black">Add New Agent</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={32} className="text-[#868e8d]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 px-6">
          <div className="flex flex-col gap-6">
            {/* Agent's Information */}
            <FormSection title="Agent's Information">
              {renderField(TextInput, 'Username', 'username', { placeholder: 'Enter username', required: true })}
              {renderField(TextInput, 'Email Address', 'email', { placeholder: 'agent@example.com', type: 'email', required: true })}
              {renderField(PasswordInput, 'Password', 'password', { placeholder: 'Insert password here', required: true })}
              <FormLabel label="Agent Type">
                <SelectInput
                  value={formData.agent_type}
                  onChange={(e) => handleChange('agent_type', e.target.value)}
                  options={AGENT_TYPE_OPTIONS}
                  placeholder="Select agent type"
                />
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
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
