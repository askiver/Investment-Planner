import type { FieldDef } from './types';

/** Per-field model binding carried by schema */
export type ModelBinding<TForm, TModel> = {
  /** Property name on the model (or patch key for reducer) */
  key: keyof TModel | string;
  /** Form → Model transform (e.g., % → decimal) */
  toModel?: (val: any, all: TForm, model?: TModel) => any;
  /** Model → Form (e.g., decimal → %) */
  fromModel?: (model: TModel) => any;
};

/** Extend FieldDef with optional model binding */
export type BoundFieldDef<TForm, TModel> = FieldDef<TForm> & {
  model?: ModelBinding<TForm, TModel>;
};

/** Build form values from a model using schema’s fromModel or identity */
export function formFromModel<TForm extends Record<string, any>, TModel>(
  schema: BoundFieldDef<TForm, TModel>[],
  model: TModel
): TForm {
  const out: Record<string, any> = {};
  for (const f of schema) {
    const bind = f.model;
    if (bind?.fromModel) {
      out[f.key as string] = bind.fromModel(model);
    } else if (bind?.key) {
      out[f.key as string] = (model as any)[bind.key as string];
    } else {
      // default: same key name
      out[f.key as string] = (model as any)[f.key as string];
    }
  }
  return out as TForm;
}

/** Make a patch {key,value} for the model/reducer from one field change */
export function patchFromField<TForm extends Record<string, any>, TModel>(
  schema: BoundFieldDef<TForm, TModel>[],
  key: keyof TForm,
  value: any,
  all: TForm,
  model?: TModel
): { key: string; value: any } {
  const f = schema.find(s => s.key === key);
  if (!f) return { key: key as string, value };
  const bind = f.model;

  const modelKey = (bind?.key ?? key) as string;
  const modelValue = bind?.toModel ? bind.toModel(value, all, model) : value;

  return { key: modelKey, value: modelValue };
}

/** Reduce a whole form into a props object keyed by model properties */
export function toModelProps<TForm extends Record<string, any>, TModel>(
  schema: BoundFieldDef<TForm, TModel>[],
  form: TForm
): Record<string, any> {
  const props: Record<string, any> = {};
  for (const f of schema) {
    const bind = f.model;
    const formVal = (form as any)[f.key as string];
    const modelKey = (bind?.key ?? f.key) as string;
    const modelVal = bind?.toModel ? bind.toModel(formVal, form) : formVal;
    props[modelKey] = modelVal;
  }
  return props;
}
