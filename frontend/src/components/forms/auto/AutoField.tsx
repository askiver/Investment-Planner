import React from 'react';
import type { FieldDef, NumberField, SelectField, ColorField, RateTypeField } from './types';
import RateTypePicker from '@/components/investment-form/fields/RateTypePicker';
import ColorPicker from '@/components/investment-form/fields/ColorPicker';

type Variant = 'form' | 'inline';

type Props<T> = {
  field: FieldDef<T>;
  value: any;
  onChange: (key: keyof T, value: any) => void;
  values: T;
  ctx?: any;
  variant?: Variant; // form vs inline layout
};

export default function AutoField<T>({
  field, value, onChange, values, ctx, variant = 'form',
}: Props<T>) {
  if (field.visible && !field.visible(values)) return null;
  const name = String(field.key);
  const wrapperClass = variant === 'inline' ? 'inline-field' : 'form-group';

  switch (field.kind) {
    case 'text':
      return (
        <div className={wrapperClass}>
          <label>{field.label}</label>
          <input
            name={name}
            value={value ?? ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={field.required}
          />
        </div>
      );

    case 'number': {
      const f = field as NumberField<T>;
      return (
        <div className={wrapperClass}>
          <label>{f.label}</label>
          <div className="input-with-suffix">
            <input
              name={name}
              type="number"
              value={value ?? ''}
              min={f.min}
              max={f.max}
              step={f.step}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={f.required}
            />
            {f.suffix ? <span className="suffix">{f.suffix}</span> : null}
          </div>
        </div>
      );
    }

    case 'select': {
      const f = field as SelectField<T>;
      const opts = Array.isArray(f.options) ? f.options : f.options(ctx, values);
      return (
        <div className={wrapperClass}>
          <label>{f.label}</label>
          <select
            name={name}
            value={value ?? ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={field.required}
          >
            {f.allowEmpty && <option value="">None</option>}
            {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    }

    case 'rateType':
      return (
        <div className={wrapperClass}>
          <RateTypePicker
            idPrefix={name}
            value={value}
            onChange={(rateType) => onChange(field.key, rateType)}
          />
        </div>
      );

    case 'color': {
      const f = field as ColorField<T>;
      return (
        <div className={wrapperClass}>
          <ColorPicker
            value={value}
            defaultColor={f.defaultColor}
            onChange={(color) => onChange(field.key, color)}
          />
        </div>
      );
    }

    default:
      return null;
  }
}
