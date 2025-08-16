// src/components/investment-form/PropertyForm.tsx
import { useState } from 'react';
import type { Property } from '@/models';
import { buildProperty } from '../builders';
import { propertyDefaults } from '../defaults';
import { propertySpecs as S } from '@/components/forms/specs';
import { numberInputProps, textInputProps } from '@/components/forms/ui';
import RateTypePicker from '../fields/RateTypePicker';
import ColorPicker from '../fields/ColorPicker';

export default function PropertyForm({ onSubmit }: { onSubmit: (p: Property) => void }) {
  const [v, setV] = useState(propertyDefaults);

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setV((s: any) => ({ ...s, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(buildProperty(v));
      }}
      className="investment-form"
    >
      <div className="form-group">
        <label>{S.name.label}</label>
        <input {...textInputProps(S.name)} name="name" value={v.name} onChange={change} required />
      </div>

      <div className="form-group">
        <label>{S.initialValue.label}</label>
        <input
          {...numberInputProps(S.initialValue)}
          name="initialValue"
          type="number"
          value={v.initialValue}
          onChange={change}
          required
        />
      </div>

      <div className="form-group">
        <label>{S.currentValue.label}</label>
        <input
          {...numberInputProps(S.currentValue)}
          name="currentValue"
          type="number"
          value={v.currentValue}
          onChange={change}
          required
        />
      </div>

      <div className="form-group">
        <label>{S.startMonths.label}</label>
        <input
          {...numberInputProps(S.startMonths)}
          name="startMonths"
          type="number"
          value={v.startMonths}
          onChange={change}
        />
      </div>

      <div className="form-group">
        <label>{S.taxRate.label}</label>
        <input
          {...numberInputProps(S.taxRate)}
          name="taxRate"
          type="number"
          value={v.taxRate}
          onChange={change}
          required
        />
      </div>

      <div className="form-group">
        <label>{S.yearlyRatePct.label}</label>
        <input
          {...numberInputProps(S.yearlyRatePct)}
          name="expectedReturn"
          type="number"
          value={v.expectedReturn}
          onChange={change}
          required
        />
      </div>

      <RateTypePicker
        idPrefix="property"
        value={v.rateType}
        onChange={(rateType) => setV((s: any) => ({ ...s, rateType }))}
      />

      <ColorPicker
        value={v.color}
        defaultColor="#8884d8"
        onChange={(color) => setV((s: any) => ({ ...s, color }))}
      />

      <button type="submit" className="submit-button">Add</button>
    </form>
  );
}