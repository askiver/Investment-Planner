export type FieldKind = 'text' | 'number' | 'select' | 'rateType' | 'color';
export type Option = { value: string; label: string };

export interface BaseField<T> {
  key: keyof T;           // form key
  label: string;
  kind: FieldKind;
  required?: boolean;
  visible?: (values: T) => boolean; // conditional field
}

export interface TextField<T> extends BaseField<T> {
  kind: 'text';
  maxLength?: number;
}

export interface NumberField<T> extends BaseField<T> {
  kind: 'number';
  min?: number; max?: number; step?: number | 'any';
  suffix?: string;         // purely visual
}

export interface SelectField<T> extends BaseField<T> {
  kind: 'select';
  allowEmpty?: boolean;
  options: Option[] | ((ctx: any, values: T) => Option[]);
}

export interface RateTypeField<T> extends BaseField<T> { kind: 'rateType' }
export interface ColorField<T> extends BaseField<T> { kind: 'color'; defaultColor?: string }

export type FieldDef<T> =
  | TextField<T>
  | NumberField<T>
  | SelectField<T>
  | RateTypeField<T>
  | ColorField<T>;
