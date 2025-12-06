import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { TextInput, PasswordInput } from '../form';
import FormField from './FormField';

export default function VerificationModal({ isOpen, onClose, onConfirm, title = "Verification", message }) {
  const [credentials, setCredentials] = useState({
    loginId: '',
    password: ''
  });

  const handleConfirm = () => {
    onConfirm(credentials);
    setCredentials({ loginId: '', password: '' });
  };

  const handleClose = () => {
    onClose();
    setCredentials({ loginId: '', password: '' });
  };

  const isFormValid = credentials.loginId.trim() !== '' && credentials.password.trim() !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isFormValid}>
            Confirm
          </Button>
        </>
      }
    >
      {message && (
        <p className="text-gray-600 mb-6">{message}</p>
      )}
      
      <div className="space-y-4">
        <FormField label="Login ID">
          <TextInput
            value={credentials.loginId}
            onChange={(e) => setCredentials({ ...credentials, loginId: e.target.value })}
            placeholder="Insert your login id here"
          />
        </FormField>

        <FormField label="Password">
          <PasswordInput
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            placeholder="Insert your login password here"
          />
        </FormField>
      </div>
    </Modal>
  );
}
