// src/components/investment-form/defaults.ts
import type {
  InvestmentType, PropertyFormValues, StockFormValues,
  LoanFormValues, StudentLoanFormValues
} from '../forms/types';

export const propertyDefaults: PropertyFormValues = {
  name: 'Standard Apartment',
  initialValue: '4000000',
  currentValue: '4000000',
  expectedReturn: '3',
  taxRate: '22',
  startMonths: '0',
  color: '#1f77b4',
  rateType: 'effective',
};

export const stockDefaults: StockFormValues = {
  name: 'Index Fund',
  initialValue: '100000',
  currentValue: '100000',
  expectedReturn: '7',
  taxRate: '22',
  startMonths: '0',
  color: '#2ca02c',
  rateType: 'effective',
};

export const loanDefaults: LoanFormValues = {
  name: 'Mortgage',
  principal: '3000000',
  effectiveInterestRate: '5',
  years: '25',
  months: '0',
  monthsDelayed: '0',
  startMonths: '0',
  color: '#d62728',
  rateType: 'effective',
  downPayment: '0',
  stockSourceId: '',
};

export const studentLoanDefaults: StudentLoanFormValues = {
  name: 'Student Loan',
  principal: '50000',
  effectiveInterestRate: '4.5',
  years: '10',
  months: '0',
  monthsDelayed: '0',
  startMonths: '0',
  color: '#9467bd',
  rateType: 'effective',
};

export const norwegianDefaults = {
  Property: propertyDefaults,
  Stock: stockDefaults,
  Loan: loanDefaults,
  'Student Loan': studentLoanDefaults,
} as const satisfies Record<InvestmentType, any>;
