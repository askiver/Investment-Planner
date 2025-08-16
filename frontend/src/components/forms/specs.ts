// src/forms/specs.ts

/** Shared field spec types used by create/edit forms */
export type NumberSpec = {
  label: string;
  min?: number;
  max?: number;
  step?: number | 'any';
  /** Optional UI hint like '%' (input remains plain number) */
  suffix?: string;
};

export type TextSpec = {
  label: string;
  maxLength?: number;
};

export type SelectSpec = {
  label: string;
  /** Allow empty option (e.g., "None") */
  allowEmpty?: boolean;
};

/** Common fields used across assets/loans */
export const commonSpecs = {
  name: { label: 'Name' } as TextSpec,
  startMonths: { label: 'Start Month', min: 0, step: 1 } as NumberSpec,
} as const;

/** Property (real estate) */
export const propertySpecs = {
  name: commonSpecs.name,
  initialValue: { label: 'Initial Value', min: 0, step: 'any' } as NumberSpec,
  currentValue: { label: 'Current Value', min: 0, step: 'any' } as NumberSpec,
  startMonths: commonSpecs.startMonths,
  taxRate: { label: 'Tax Rate (%)', min: 0, max: 100, step: 'any', suffix: '%' } as NumberSpec,
  yearlyRatePct: {
    label: 'Yearly Rate (%)',
    min: 0,
    max: 100,
    step: 'any',
    suffix: '%',
  } as NumberSpec,
  // rateType handled by a dedicated component (no spec needed)
} as const;

/** Stock / fund */
export const stockSpecs = {
  name: commonSpecs.name,
  initialValue: { label: 'Initial Value', min: 0, step: 'any' } as NumberSpec,
  currentValue: { label: 'Current Value', min: 0, step: 'any' } as NumberSpec,
  startMonths: commonSpecs.startMonths,
  taxRate: { label: 'Tax Rate (%)', min: 0, max: 100, step: 'any', suffix: '%' } as NumberSpec,
  yearlyRatePct: {
    label: 'Yearly Rate (%)',
    min: 0,
    max: 100,
    step: 'any',
    suffix: '%',
  } as NumberSpec,
  // rateType handled by a dedicated component (no spec needed)
} as const;

/** Generic loan fields used by both Loan and StudentLoan */
const loanCommon = {
  name: commonSpecs.name,
  principal: { label: 'Principal', min: 0, step: 'any' } as NumberSpec,
  startMonths: commonSpecs.startMonths,
  years: { label: 'Years', min: 0, step: 1 } as NumberSpec,
  months: { label: 'Months', min: 0, max: 11, step: 1 } as NumberSpec,
  monthsDelayed: { label: 'Delayed Months', min: 0, step: 1 } as NumberSpec,
  ratePct: { label: 'Interest Rate (%)', min: 0, max: 100, step: 'any', suffix: '%' } as NumberSpec,
  // rateType handled by a dedicated component (no spec needed)
} as const;

/** Amortizing loan (e.g., mortgage) */
export const loanSpecs = {
  ...loanCommon,
  downPayment: { label: 'Down Payment', min: 0, step: 'any' } as NumberSpec,
  stockSource: { label: 'Source of Down Payment', allowEmpty: true } as SelectSpec, // options provided dynamically
} as const;

/** Student loan (no down payment/source) */
export const studentLoanSpecs = {
  ...loanCommon,
} as const;

/** Type helpers for consumers (optional, but handy) */
export type PropertySpecs = typeof propertySpecs;
export type StockSpecs = typeof stockSpecs;
export type LoanSpecs = typeof loanSpecs;
export type StudentLoanSpecs = typeof studentLoanSpecs;
