import { Loan, Property, Stock, StudentLoan } from '@/models/models';

/** Normalized prop objects for model constructors (one place to maintain) */
export type LoanProps = {
  id: string; name: string; principal: number; yearlyRate: number; effectiveRate: boolean;
  years: number; months: number; monthsDelayed: number; startMonths: number;
  color: string; downPayment: number; stockSourceId: string | null;
};

export type PropertyProps = {
  id: string; name: string; startMonths: number; initialValue: number; currentValue: number;
  yearlyRate: number; effectiveRate: boolean; taxRate: number; color: string;
};

export type StockProps = {
  id: string; name: string; startMonths: number; initialValue: number; currentValue: number;
  yearlyRate: number; effectiveRate: boolean; taxRate: number; color: string;
};

export type StudentLoanProps = {
  id: string; name: string; principal: number; yearlyRate: number; effectiveRate: boolean;
  years: number; months: number; monthsDelayed: number; startMonths: number; color: string;
};

/** Constructors (single point of truth for arg order) */
export const createLoan = (p: LoanProps) =>
  new Loan(
    p.id, p.name, p.principal, p.yearlyRate, p.effectiveRate,
    p.years, p.months, p.monthsDelayed, p.startMonths, p.color, p.downPayment, p.stockSourceId
  );

export const createProperty = (p: PropertyProps) =>
  new Property(
    p.id, p.name, p.startMonths, p.initialValue, p.currentValue,
    p.yearlyRate, p.effectiveRate, p.taxRate, p.color
  );

export const createStock = (p: StockProps) =>
  new Stock(
    p.id, p.name, p.startMonths, p.initialValue, p.currentValue,
    p.yearlyRate, p.effectiveRate, p.taxRate, p.color
  );

export const createStudentLoan = (p: StudentLoanProps) =>
  new StudentLoan(
    p.id, p.name, p.principal, p.yearlyRate, p.effectiveRate,
    p.years, p.months, p.monthsDelayed, p.startMonths, p.color
  );
