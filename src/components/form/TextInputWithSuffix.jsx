export default function TextInputWithSuffix({ placeholder, value, onChange, suffix, type = 'text', className = '', ...restProps }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-[#f3f3f5] px-4 py-3 rounded-md font-medium text-md text-black placeholder:text-[#a1abaa] outline-none w-full pr-12 ${className}`}
        {...restProps}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#868e8d] font-medium text-md pointer-events-none">
        {suffix}
      </span>
    </div>
  );
}
