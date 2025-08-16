// src/models/create.ts
import { Loan, Property, Stock, StudentLoan } from '@/models/models';

/** Allow swapping the ID generator in tests */
let makeId: () => string =
  () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

export const setIdGenerator = (fn: () => string) => { makeId = fn; };

/* ---------- Shared helpers ---------- */
const num = (v: unknown, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : d;
};
const int = (v: unknown, d = 0) => Math.max(0, Math.trunc(num(v, d)));

/* ---------- Property ---------- */
export type PropertyInit = {
  id?: string;
  name: string;
  startMonths: number;
  initialValue: number;
  currentValue: number;
  yearlyRate: number;      // decimal (e.g., 0.03)
  effectiveRate: boolean;
  taxRate: number;         // decimal (e.g., 0.22)
  color?: string;
};

export function createProperty(p: PropertyInit): Property {
  const id = p.id ?? makeId();
  return new Property(
    id,
    p.name,
    int(p.startMonths),
    num(p.initialValue),
    num(p.currentValue),
    num(p.yearlyRate),
    !!p.effectiveRate,
    num(p.taxRate),
    p.color ?? '#1f77b4'
  );
}

/* ---------- Stock ---------- */
export type StockInit = {
  id?: string;
  name: string;
  startMonths: number;
  initialValue: number;
  currentValue: number;
  yearlyRate: number;      // decimal
  effectiveRate: boolean;
  taxRate: number;         // decimal
  color?: string;
};

export function createStock(p: StockInit): Stock {
  const id = p.id ?? makeId();
  return new Stock(
    id,
    p.name,
    int(p.startMonths),
    num(p.initialValue),
    num(p.currentValue),
    num(p.yearlyRate),
    !!p.effectiveRate,
    num(p.taxRate),
    p.color ?? '#2ca02c'
  );
}

/* ---------- Loan (mortgage etc.) ---------- */
export type LoanInit = {
  id?: string;
  name: string;
  principal: number;
  yearlyRate: number;       // decimal
  effectiveRate: boolean;
  years: number;
  months: number;
  monthsDelayed: number;
  startMonths: number;
  color?: string;
  downPayment?: number;
  stockSourceId?: string | null;
};

export function createLoan(p: LoanInit): Loan {
  const id = p.id ?? makeId();
  return new Loan(
    id,
    p.name,
    num(p.principal),
    num(p.yearlyRate),
    !!p.effectiveRate,
    int(p.years),
    int(p.months),
    int(p.monthsDelayed),
    int(p.startMonths),
    p.color ?? '#ff7300',
    num(p.downPayment ?? 0),
    p.stockSourceId ?? null
  );
}

/* ---------- Student Loan ---------- */
export type StudentLoanInit = {
  id?: string;
  name: string;
  principal: number;
  yearlyRate: number;       // decimal
  effectiveRate: boolean;
  years: number;
  months: number;
  monthsDelayed: number;
  startMonths: number;
  color?: string;
};

export function createStudentLoan(p: StudentLoanInit): StudentLoan {
  const id = p.id ?? makeId();
  return new StudentLoan(
    id,
    p.name,
    num(p.principal),
    num(p.yearlyRate),
    !!p.effectiveRate,
    int(p.years),
    int(p.months),
    int(p.monthsDelayed),
    int(p.startMonths),
    p.color ?? '#9467bd'
  );
}
