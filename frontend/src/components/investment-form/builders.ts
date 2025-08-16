// src/components/investment-form/builders.ts
import { Property, Stock, Loan, StudentLoan } from '@/models/models';
import type {
  PropertyFormValues, StockFormValues, LoanFormValues, StudentLoanFormValues
} from '../forms/types';
import { expandedColors } from '@/utils/colorPalette';

const pickColor = (c?: string) =>
  c && c.trim() ? c : expandedColors[Math.floor(Math.random() * expandedColors.length)];

const isEffective = (rateType: 'effective' | 'nominal') => rateType === 'effective';

const id = () => (globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`);

export function buildProperty(v: PropertyFormValues): Property {
  return new Property(
    id(),
    v.name,
    parseInt(v.startMonths || '0', 10),
    parseFloat(v.initialValue),
    parseFloat(v.currentValue),
    parseFloat(v.expectedReturn) / 100,
    isEffective(v.rateType),
    parseFloat(v.taxRate) / 100,
    pickColor(v.color),
  );
}

export function buildStock(v: StockFormValues): Stock {
  return new Stock(
    id(),
    v.name,
    parseInt(v.startMonths || '0', 10),
    parseFloat(v.initialValue),
    parseFloat(v.currentValue),
    parseFloat(v.expectedReturn) / 100,
    isEffective(v.rateType),
    parseFloat(v.taxRate) / 100,
    pickColor(v.color),
  );
}

export function buildLoan(v: LoanFormValues): Loan {
  return new Loan(
    id(),
    v.name,
    parseFloat(v.principal),
    parseFloat(v.effectiveInterestRate) / 100,
    isEffective(v.rateType),
    parseInt(v.years, 10),
    parseInt(v.months || '0', 10),
    parseInt(v.monthsDelayed || '0', 10),
    parseInt(v.startMonths || '0', 10),
    pickColor(v.color),
    parseFloat(v.downPayment || '0'),
    v.stockSourceId || null,
  );
}

export function buildStudentLoan(v: StudentLoanFormValues): StudentLoan {
  return new StudentLoan(
    id(),
    v.name,
    parseFloat(v.principal),
    parseFloat(v.effectiveInterestRate) / 100,
    isEffective(v.rateType),
    parseInt(v.years, 10),
    parseInt(v.months || '0', 10),
    parseInt(v.monthsDelayed || '0', 10),
    parseInt(v.startMonths || '0', 10),
    pickColor(v.color),
  );
}
