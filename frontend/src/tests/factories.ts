// tests/factories.ts
import { Loan, Property, Stock } from '@/models';

type LoanOverrides = Partial<{
  id: string;
  name: string;
  principal: number;
  yearlyRate: number;
  effectiveRate: boolean;
  years: number;
  months: number;
  monthsDelayed: number;
  startMonths: number;
  color: string;
  downPayment: number;
  stockSourceId: string | null;
}>;

export const makeLoan = (over: LoanOverrides = {}) => {
  const d = {
    id: 'L1',
    name: 'Mortgage',
    principal: 3_000_000,
    yearlyRate: 0.05,
    effectiveRate: true,
    years: 25,
    months: 0,
    monthsDelayed: 0,
    startMonths: 0,
    color: '#d62728',
    downPayment: 0,
    stockSourceId: null as string | null,
    ...over,
  };
  return new Loan(
    d.id, d.name, d.principal, d.yearlyRate, d.effectiveRate,
    d.years, d.months, d.monthsDelayed, d.startMonths, d.color,
    d.downPayment, d.stockSourceId
  );
};

type StockOverrides = Partial<{
  id: string;
  name: string;
  startMonths: number;
  initialValue: number;
  currentValue: number;
  yearlyRate: number;
  effectiveRate: boolean;
  taxRate: number;
  color: string;
}>;

export const makeStock = (over: StockOverrides = {}) => {
  const d = {
    id: 'S1',
    name: 'Index Fund',
    startMonths: 0,
    initialValue: 100_000,
    currentValue: 100_000,
    yearlyRate: 0.07,
    effectiveRate: true,
    taxRate: 0.22,
    color: '#2ca02c',
    ...over,
  };
  return new Stock(
    d.id, d.name, d.startMonths, d.initialValue, d.currentValue,
    d.yearlyRate, d.effectiveRate, d.taxRate, d.color
  );
};

type PropertyOverrides = Partial<{
  id: string;
  name: string;
  startMonths: number;
  initialValue: number;
  currentValue: number;
  yearlyRate: number;
  effectiveRate: boolean;
  taxRate: number;
  color: string;
}>;

export const makeProperty = (over: PropertyOverrides = {}) => {
  const d = {
    id: 'P1',
    name: 'Apartment',
    startMonths: 0,
    initialValue: 4_000_000,
    currentValue: 4_000_000,
    yearlyRate: 0.03,
    effectiveRate: true,
    taxRate: 0.22,
    color: '#1f77b4',
    ...over,
  };
  return new Property(
    d.id, d.name, d.startMonths, d.initialValue, d.currentValue,
    d.yearlyRate, d.effectiveRate, d.taxRate, d.color
  );
};
