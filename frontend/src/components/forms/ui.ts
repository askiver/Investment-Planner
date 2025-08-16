// src/forms/ui.ts
import type { NumberSpec, TextSpec } from './specs';

export const numberInputProps = (spec: NumberSpec) => ({
  min: spec.min,
  max: spec.max,
  step: spec.step,
  placeholder: spec.placeholder,
});

export const textInputProps = (spec: TextSpec) => ({
  placeholder: spec.placeholder,
});
