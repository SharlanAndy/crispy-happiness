export default function TextInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-[#f3f3f5] px-4 py-3 rounded-md font-medium text-md text-black placeholder:text-[#a1abaa] outline-none w-full"
    />
  );
}
