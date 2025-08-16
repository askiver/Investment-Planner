import { numberInputProps } from '@/components/forms/ui';
import type { NumberSpec } from '@/components/forms/specs';

export default function InlineNumber({
  value,
  onChange,
  spec,
  width = 90,
}: {
  value: string | number;
  onChange: (raw: string) => void;
  spec: NumberSpec;
  width?: number;
}) {
  return (
    <input
      type="number"
      {...numberInputProps(spec)}
      style={{ width }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
