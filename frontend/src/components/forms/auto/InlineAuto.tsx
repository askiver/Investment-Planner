import React from 'react';
import type { Schema, FieldSpec, Option } from '../schemas';

type Props<TModel> = {
  schema: Schema<TModel>;
  model: TModel;
  onEdit: (field: string, value: string | number | boolean) => void;
  context?: any;
};

export default function InlineAuto<TModel>({ schema, model, onEdit, context }: Props<TModel>) {
  const renderField = (f: FieldSpec<TModel>) => {
    if (!f.inEdit) return null;

    const name = f.editKey || f.key;
    const display = f.format ? f.format(model) : (model as any)[name];

    const push = (raw: string) => {
      const parsed = f.parseEdit ? f.parseEdit(raw) : raw;
      onEdit(name, parsed as any);
    };

    const label = f.label;

    switch (f.kind) {
      case 'text':
        return (
          <div className="inline-field" key={f.key}>
            <span className="inline-label">{label}</span>
            <input style={{ width: 140 }} value={String(display ?? '')} onChange={(e) => push(e.target.value)} />
          </div>
        );
      case 'number':
        return (
          <div className="inline-field" key={f.key}>
            <span className="inline-label">{label}</span>
            <input
              style={{ width: 120 }}
              type="number"
              value={String(display ?? 0)}
              min={f.min as any}
              max={f.max as any}
              step={f.step as any}
              onChange={(e) => push(e.target.value)}
            />
          </div>
        );
      case 'color':
        return (
          <div className="inline-field" key={f.key}>
            <span className="inline-label">{label}</span>
            <input type="color" value={String(display ?? '#000000')} onChange={(e) => push(e.target.value)} />
          </div>
        );
      case 'radio': {
        const ops = typeof f.options === 'function' ? (f.options(context) as Option[]) : (f.options || []);
        const selected = String(display ?? '');
        return (
          <div className="inline-field" key={f.key}>
            <span className="inline-label">{label}</span>
            <div>
              {ops.map(o => (
                <label key={o.value} style={{ marginRight: 8 }}>
                  <input
                    type="radio"
                    name={`${name}-${(model as any).id ?? ''}`}
                    value={o.value}
                    checked={selected === o.value}
                    onChange={(e) => push(e.target.value)}
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
          <div className="inline-field" key={f.key}>
            <span className="inline-label">{label}</span>
            <select value={String(display ?? '')} onChange={(e) => push(e.target.value)}>
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

  return <>{schema.fields.map(renderField)}</>;
}
