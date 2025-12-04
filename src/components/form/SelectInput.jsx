import { ChevronDown } from 'lucide-react';

export default function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="bg-[#f3f3f5] px-[20px] py-[15px] rounded-[7px] font-medium text-[18px] text-black outline-none w-full appearance-none pr-[50px]"
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => {
          // Handle both string and object formats
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      <ChevronDown size={24} className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[#868e8d] pointer-events-none" />
    </div>
  );
}
