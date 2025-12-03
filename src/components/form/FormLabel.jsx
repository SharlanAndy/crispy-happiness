export default function FormLabel({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-[18px] text-black">{label}</p>
      {children}
    </div>
  );
}
