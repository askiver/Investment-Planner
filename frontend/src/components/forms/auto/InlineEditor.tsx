import React from 'react';
import AutoField from './AutoField';
import type { FieldDef } from './types';

type Props<T> = {
  schema: FieldDef<T>[];
  values: T;
  onFieldChange: (key: keyof T, value: any, all: T) => void; // <-- pass all values
  ctx?: any;
  className?: string;
};

export default function InlineEditor<T>({
  schema, values, onFieldChange, ctx, className = 'inline-fields',
}: Props<T>) {
  return (
    <div className={className}>
      {schema.map(f => (
        <AutoField
          key={String(f.key)}
          field={f as any}
          value={(values as any)[f.key]}
          values={values}
          onChange={(k, v) => onFieldChange(k, v, values)} // <-- send all
          ctx={ctx}
          variant="inline"
        />
      ))}
    </div>
  );
}
