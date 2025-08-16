import React, { useState } from 'react';
import type { Schema, FieldSpec, Option } from '../schemas';

type Props<TModel> = {
  schema: Schema<TModel>;
  onSubmit: (model: TModel) => void;
  /** dynamic data, e.g. { stocks } for loan stockSourceId options */
  context?: any;
  className?: string;
};

export default function AutoForm<TModel>({ schema, onSubmit, context, className }: Props<TModel>) {
  const [v, setV] = useState<Record<string, string>>(schema.defaults);

  const change = (name: string, value: string) => setV(s => ({ ...s, [name]: value }));

  const renderField = (f: FieldSpec<any>) => {
    if (!f.inCreate) return null;
    const value = v[f.key] ?? '';

    switch (f.kind) {
      case 'text':
        return (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            <input name={f.key} value={value} onChange={(e) => change(f.key, e.target.value)} required={f.required} />
          </div>
        );
      case 'number':
        return (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            <input
              name={f.key}
              type="number"
              value={value}
              min={f.min as any}
              max={f.max as any}
              step={f.step as any}
              onChange={(e) => change(f.key, e.target.value)}
              required={f.required}
            />
          </div>
        );
      case 'color':
        return (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            <input name={f.key} type="color" value={value || '#000000'} onChange={(e) => change(f.key, e.target.value)} />
          </div>
        );
      case 'radio': {
        const ops = typeof f.options === 'function' ? (f.options(context) as Option[]) : (f.options || []);
        const selected = value || String(ops[0]?.value ?? '');
        return (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            <div className="rate-type-options">
              {ops.map(o => (
                <label key={o.value} style={{ marginRight: 8 }}>
                  <input
                    type="radio"
                    name={f.key}
                    value={o.value}
                    checked={selected === o.value}
                    onChange={(e) => change(f.key, e.target.value)}
                  /> {o.label}
                </label>
              ))}
            </div>
          </div>
        );
      }
      case 'select': {
        const ops = typeof f.options === 'function' ? (f.options(context) as Option[]) : (f.options || []);
        return (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            <select name={f.key} value={value} onChange={(e) => change(f.key, e.target.value)}>
              {ops.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const model = schema.build(v, context);
        onSubmit(model);
        setV(schema.defaults);
      }}
      className={className ?? 'investment-form'}
    >
      {schema.fields.map(renderField)}
      <button type="submit" className="submit-button">Add</button>
    </form>
  );
}
