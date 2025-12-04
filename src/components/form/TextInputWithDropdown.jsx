export default function TextInputWithDropdown({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  step,
  dropdownValue,
  onDropdownChange,
  dropdownOptions = [],
  className = ''
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        className={`bg-[#f3f3f5] px-4 py-3 rounded-md font-medium text-md text-black placeholder:text-[#a1abaa] outline-none w-full pr-24 ${className}`}
      />
      <select
        value={dropdownValue}
        onChange={onDropdownChange}
        className="absolute right-[1rem] top-0 bottom-0 bg-transparent px-2 py-3 rounded-r-md font-medium text-md text-black outline-none cursor-pointer"
      >
        {dropdownOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
