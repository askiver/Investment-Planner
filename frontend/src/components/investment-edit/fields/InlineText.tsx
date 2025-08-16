import { textInputProps } from '@/components/forms/ui';
import type { TextSpec } from '@/components/forms/specs';

export default function InlineText({
  value,
  onChange,
  spec,
  width = 140,
}: {
  value: string;
  onChange: (raw: string) => void;
  spec: TextSpec;
  width?: number;
}) {
  return (
    <input
      type="text"
      {...textInputProps(spec)}
      style={{ width }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
