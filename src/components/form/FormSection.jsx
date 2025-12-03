export default function FormSection({ title, children }) {
  return (
    <div className="border border-neutral-200 rounded-3xl p-8 flex flex-col gap-6">
      <h3 className="font-semibold text-lg text-black">{title}</h3>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
