// src/components/investment-edit/fields/ColorInput.tsx
export default function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />;
}
