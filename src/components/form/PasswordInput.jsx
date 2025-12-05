import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ placeholder, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-[#f3f3f5] px-4 py-3 rounded-md font-medium text-md text-black placeholder:text-[#a1abaa] outline-none w-full pr-12"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#868e8d] hover:text-black transition-colors"
        tabIndex={-1}
      >
        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    </div>
  );
}
