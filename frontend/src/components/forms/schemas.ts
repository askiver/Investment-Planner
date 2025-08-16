import type { Stock, Property, Loan, StudentLoan } from '@/models/models';
import { createStock, createProperty, createLoan, createStudentLoan } from '@/models/create';

/** Generic option type for select & radio */
export type Option = { label: string; value: string };

/** Field spec renders both in Create form and Edit row */
export type FieldSpec<TModel> = {
  /** Form/edit logical key (input name). For editing, you'll pass editKey to `onEdit` if provided */
  key: string;
  label: string;
  kind: 'text' | 'number' | 'radio' | 'color' | 'select';

  /** Where to render this field */
  inCreate?: boolean;
  inEdit?: boolean;

  /** HTML number constraints */
  min?: number;
  max?: number;
  step?: number;

  /** For edit: how to show from model -> input */
  format?: (model: TModel) => string | number;

  /** For edit: which update key to pass to onEdit (if different than `key`) */
  editKey?: string;

  /** For parsing values before calling onEdit (edit) */
  parseEdit?: (raw: string) => string | number | boolean;

  /** For create form display → we keep raw string values; builder converts at submit */
  required?: boolean;

  /** Options for radio/select (can be dynamic with context) */
  options?: Option[] | ((ctx: any) => Option[]);
};

export type Schema<TModel> = {
  type: 'stock' | 'property' | 'loan' | 'studentLoan';
  fields: FieldSpec<TModel>[];

  /** Defaults used by create form (strings, as they go into inputs) */
  defaults: Record<string, string>;

  /** How to build the model instance from raw string values and context */
  build: (values: Record<string, string>, ctx?: any) => TModel;
};

/* ───────── STOCK ───────── */
export const stockSchema: Schema<Stock> = {
  type: 'stock',
  fields: [
    { key: 'name', label: 'Name', kind: 'text', inCreate: true, inEdit: true, required: true },
    { key: 'initialValue', label: 'Initial Value', kind: 'number', min: 0, step: 0.01, inCreate: true, inEdit: true },
    { key: 'currentValue', label: 'Current Value', kind: 'number', min: 0, step: 0.01, inCreate: true, inEdit: true },
    { key: 'startMonths', label: 'Start Month', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    {
      key: 'taxRate',
      label: 'Tax Rate (%)',
      kind: 'number',
      min: 0, max: 100, step: 0.01,
      inCreate: true, inEdit: true,
      format: (m) => (m.taxRate ?? 0) * 100,
      editKey: 'taxRate',
      parseEdit: (raw) => Number(raw), // reducer will divide by 100 if needed
    },
    {
      key: 'expectedReturn',
      label: 'Yearly Rate (%)',
      kind: 'number',
      min: 0, max: 100, step: 0.01,
      inCreate: true, inEdit: true,
      format: (m) => (m.yearlyRate ?? 0) * 100,
      editKey: 'expectedReturn',
      parseEdit: (raw) => Number(raw),
    },
    {
      key: 'rateType',
      label: 'Rate type',
      kind: 'radio',
      inCreate: true, inEdit: true,
      options: [
        { label: 'Nominal', value: 'nominal' },
        { label: 'Effective', value: 'effective' },
      ],
      format: (m) => (m.effectiveRate ? 'effective' : 'nominal'),
      editKey: 'rateType',
      parseEdit: (raw) => raw,
    },
    { key: 'color', label: 'Color', kind: 'color', inCreate: true, inEdit: true },
  ],
  defaults: {
    name: 'Index Fund',
    initialValue: '100000',
    currentValue: '100000',
    startMonths: '0',
    taxRate: '22',
    expectedReturn: '7',
    rateType: 'effective',
    color: '#2ca02c',
  },
  build(values) {
    return createStock({
      name: values.name,
      startMonths: Number(values.startMonths || 0),
      initialValue: Number(values.initialValue),
      currentValue: Number(values.currentValue),
      yearlyRate: Number(values.expectedReturn) / 100,
      effectiveRate: values.rateType === 'effective',
      taxRate: Number(values.taxRate) / 100,
      color: values.color,
    });
  },
};

/* ───────── PROPERTY ───────── */
export const propertySchema: Schema<Property> = {
  type: 'property',
  fields: [
    { key: 'name', label: 'Name', kind: 'text', inCreate: true, inEdit: true, required: true },
    { key: 'initialValue', label: 'Initial Value', kind: 'number', min: 0, step: 0.01, inCreate: true, inEdit: true },
    { key: 'currentValue', label: 'Current Value', kind: 'number', min: 0, step: 0.01, inCreate: true, inEdit: true },
    { key: 'startMonths', label: 'Start Month', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    {
      key: 'taxRate',
      label: 'Tax Rate (%)',
      kind: 'number',
      min: 0, max: 100, step: 0.01,
      inCreate: true, inEdit: true,
      format: (m) => (m.taxRate ?? 0) * 100,
      editKey: 'taxRate',
      parseEdit: (raw) => Number(raw),
    },
    {
      key: 'expectedReturn',
      label: 'Yearly Rate (%)',
      kind: 'number',
      min: 0, max: 100, step: 0.01,
      inCreate: true, inEdit: true,
      format: (m) => (m.yearlyRate ?? 0) * 100,
      editKey: 'expectedReturn',
      parseEdit: (raw) => Number(raw),
    },
    {
      key: 'rateType',
      label: 'Rate type',
      kind: 'radio',
      inCreate: true, inEdit: true,
      options: [
        { label: 'Nominal', value: 'nominal' },
        { label: 'Effective', value: 'effective' },
      ],
      format: (m) => (m.effectiveRate ? 'effective' : 'nominal'),
      editKey: 'rateType',
      parseEdit: (raw) => raw,
    },
    { key: 'color', label: 'Color', kind: 'color', inCreate: true, inEdit: true },
  ],
  defaults: {
    name: 'Standard Apartment',
    initialValue: '4000000',
    currentValue: '4000000',
    startMonths: '0',
    taxRate: '22',
    expectedReturn: '3',
    rateType: 'effective',
    color: '#1f77b4',
  },
  build(values) {
    return createProperty({
      name: values.name,
      startMonths: Number(values.startMonths || 0),
      initialValue: Number(values.initialValue),
      currentValue: Number(values.currentValue),
      yearlyRate: Number(values.expectedReturn) / 100,
      effectiveRate: values.rateType === 'effective',
      taxRate: Number(values.taxRate) / 100,
      color: values.color,
    });
  },
};

/* ───────── LOAN ───────── */
export const loanSchema: Schema<Loan> = {
  type: 'loan',
  fields: [
    { key: 'name', label: 'Name', kind: 'text', inCreate: true, inEdit: true, required: true },
    { key: 'principal', label: 'Principal', kind: 'number', min: 0, step: 0.01, inCreate: true, inEdit: true },
    { key: 'startMonths', label: 'Start Month', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    { key: 'years', label: 'Years', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    { key: 'months', label: 'Months', kind: 'number', min: 0, max: 11, step: 1, inCreate: true, inEdit: true },
    { key: 'monthsDelayed', label: 'Delayed Months', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    {
      key: 'effectiveInterestRate',
      label: 'Interest Rate (%)',
      kind: 'number',
      min: 0, max: 100, step: 0.01,
      inCreate: true, inEdit: true,
      format: (m) => (m.yearlyRate ?? 0) * 100,
      editKey: 'effectiveInterestRate',
      parseEdit: (raw) => Number(raw),
    },
    {
      key: 'rateType',
      label: 'Rate type',
      kind: 'radio',
      inCreate: true, inEdit: true,
      options: [
        { label: 'Nominal', value: 'nominal' },
        { label: 'Effective', value: 'effective' },
      ],
      format: (m) => (m.effectiveRate ? 'effective' : 'nominal'),
      editKey: 'rateType',
      parseEdit: (raw) => raw,
    },
    { key: 'downPayment', label: 'Down Payment', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    {
      key: 'stockSourceId',
      label: 'Source of Down Payment',
      kind: 'select',
      inCreate: true, inEdit: true,
      options: (ctx: { stocks: { id: string; name: string }[] }) => [
        { label: 'None (External funds)', value: '' },
        ...(ctx?.stocks ?? []).map(s => ({ label: s.name, value: s.id })),
      ],
    },
    { key: 'color', label: 'Color', kind: 'color', inCreate: true, inEdit: true },
  ],
  defaults: {
    name: 'Mortgage',
    principal: '3000000',
    startMonths: '0',
    years: '25',
    months: '0',
    monthsDelayed: '0',
    effectiveInterestRate: '5',
    rateType: 'effective',
    downPayment: '0',
    stockSourceId: '',
    color: '#d62728',
  },
  build(values) {
    return createLoan({
      name: values.name,
      principal: Number(values.principal),
      yearlyRate: Number(values.effectiveInterestRate) / 100,
      effectiveRate: values.rateType === 'effective',
      years: Number(values.years || 0),
      months: Number(values.months || 0),
      monthsDelayed: Number(values.monthsDelayed || 0),
      startMonths: Number(values.startMonths || 0),
      color: values.color,
      downPayment: Number(values.downPayment || 0),
      stockSourceId: values.stockSourceId || null,
    });
  },
};

/* ───────── STUDENT LOAN ───────── */
export const studentLoanSchema: Schema<StudentLoan> = {
  type: 'studentLoan',
  fields: [
    { key: 'name', label: 'Name', kind: 'text', inCreate: true, inEdit: true, required: true },
    { key: 'principal', label: 'Principal', kind: 'number', min: 0, step: 0.01, inCreate: true, inEdit: true },
    { key: 'startMonths', label: 'Start Month', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    { key: 'years', label: 'Years', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    { key: 'months', label: 'Months', kind: 'number', min: 0, max: 11, step: 1, inCreate: true, inEdit: true },
    { key: 'monthsDelayed', label: 'Delayed Months', kind: 'number', min: 0, step: 1, inCreate: true, inEdit: true },
    {
      key: 'effectiveInterestRate',
      label: 'Interest Rate (%)',
      kind: 'number',
      min: 0, max: 100, step: 0.01,
      inCreate: true, inEdit: true,
      format: (m) => (m.yearlyRate ?? 0) * 100,
      editKey: 'effectiveInterestRate',
      parseEdit: (raw) => Number(raw),
    },
    {
      key: 'rateType',
      label: 'Rate type',
      kind: 'radio',
      inCreate: true, inEdit: true,
      options: [
        { label: 'Nominal', value: 'nominal' },
        { label: 'Effective', value: 'effective' },
      ],
      format: (m) => (m.effectiveRate ? 'effective' : 'nominal'),
      editKey: 'rateType',
      parseEdit: (raw) => raw,
    },
    { key: 'color', label: 'Color', kind: 'color', inCreate: true, inEdit: true },
  ],
  defaults: {
    name: 'Student Loan',
    principal: '50000',
    startMonths: '0',
    years: '10',
    months: '0',
    monthsDelayed: '0',
    effectiveInterestRate: '4.5',
    rateType: 'effective',
    color: '#9467bd',
  },
  build(values) {
    return createStudentLoan({
      name: values.name,
      principal: Number(values.principal),
      yearlyRate: Number(values.effectiveInterestRate) / 100,
      effectiveRate: values.rateType === 'effective',
      years: Number(values.years || 0),
      months: Number(values.months || 0),
      monthsDelayed: Number(values.monthsDelayed || 0),
      startMonths: Number(values.startMonths || 0),
      color: values.color,
    });
  },
};
