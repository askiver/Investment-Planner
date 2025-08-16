// src/components/investment-form/fields/ColorPicker.tsx
type Props = { value: string; onChange: (hex: string) => void; defaultColor?: string };

export default function ColorPicker({ value, onChange, defaultColor = '#8884d8' }: Props) {
  return (
    <div className="form-group">
      <label>Color:</label>
      <input
        name="color"
        type="color"
        value={value || defaultColor}
        onChange={e => onChange(e.target.value)}
        style={{ width: 40, height: 30 }}
        title="Pick a color"
      />
    </div>
  );
}
