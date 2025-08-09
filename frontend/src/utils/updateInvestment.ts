// src/utils/updateInvestment.ts
import { Property, Stock, Loan, StudentLoan } from '../models';

export function updateInvestment(
  inv: Property | Stock | Loan | StudentLoan,
  field: string,
  value: string | number | boolean
) {
  // Keep your existing per-type logic here, unchanged initially.
  // Later, you can refactor each block safely.
  if (inv instanceof Property) {
    if (field === 'name') return new Property(inv.id, String(value), inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'startMonths') return new Property(inv.id, inv.name, parseInt(String(value)), inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'initialValue') return new Property(inv.id, inv.name, inv.startMonths, parseFloat(String(value)), inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'currentValue') return new Property(inv.id, inv.name, inv.startMonths, inv.initialValue, parseFloat(String(value)), inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'expectedReturn') return new Property(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, parseFloat(String(value)) / 100, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'taxRate') return new Property(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, parseFloat(String(value)) / 100, inv.color);
    if (field === 'color') return new Property(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, String(value));
    if (field === 'rateType') return new Property(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, value === 'effective', inv.taxRate, inv.color);
    return inv;
  }
  if (inv instanceof Stock) {
    if (field === 'name') return new Stock(inv.id, String(value), inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'startMonths') return new Stock(inv.id, inv.name, parseInt(String(value)), inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'initialValue') return new Stock(inv.id, inv.name, inv.startMonths, parseFloat(String(value)), inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'currentValue') return new Stock(inv.id, inv.name, inv.startMonths, inv.initialValue, parseFloat(String(value)), inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'expectedReturn') return new Stock(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, parseFloat(String(value)) / 100, inv.effectiveRate, inv.taxRate, inv.color);
    if (field === 'taxRate') return new Stock(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, parseFloat(String(value)) / 100, inv.color);
    if (field === 'color') return new Stock(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, String(value));
    if (field === 'rateType') return new Stock(inv.id, inv.name, inv.startMonths, inv.initialValue, inv.currentValue, inv.yearlyRate, value === 'effective', inv.taxRate, inv.color);
    return inv;
  }
  if (inv instanceof StudentLoan) {
    if (field === 'name') return new StudentLoan(inv.id, String(value), inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, inv.startMonths, inv.color);
    if (field === 'startMonths') return new StudentLoan(inv.id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, parseInt(String(value)), inv.color);
    if (field === 'principal') return new StudentLoan(inv.id, inv.name, parseFloat(String(value)), inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, inv.startMonths, inv.color);
    if (field === 'effectiveInterestRate') return new StudentLoan(inv.id, inv.name, inv.principal, parseFloat(String(value)) / 100, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, inv.startMonths, inv.color);
    if (field === 'years') return new StudentLoan(inv.id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, parseInt(String(value)), inv.months, inv.monthsDelayed, inv.startMonths, inv.color);
    if (field === 'months') return new StudentLoan(inv.id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, parseInt(String(value)), inv.monthsDelayed, inv.startMonths, inv.color);
    if (field === 'monthsDelayed') return new StudentLoan(inv.id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, parseInt(String(value)), inv.startMonths, inv.color);
    if (field === 'color') return new StudentLoan(inv.id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, inv.startMonths, String(value));
    if (field === 'rateType') return new StudentLoan(inv.id, inv.name, inv.principal, inv.yearlyRate, value === 'effective', inv.years, inv.months, inv.monthsDelayed, inv.startMonths, inv.color);
    return inv;
  }
  // Loan (non-student)
  const loan = inv as Loan;
  if (field === 'name') return new Loan(loan.id, String(value), loan.principal, loan.yearlyRate, loan.effectiveRate, loan.years, loan.months, loan.monthsDelayed, loan.startMonths, loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'startMonths') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, loan.effectiveRate, loan.years, loan.months, loan.monthsDelayed, parseInt(String(value)), loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'principal') return new Loan(loan.id, loan.name, parseFloat(String(value)), loan.yearlyRate, loan.effectiveRate, loan.years, loan.months, loan.monthsDelayed, loan.startMonths, loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'effectiveInterestRate') return new Loan(loan.id, loan.name, loan.principal, parseFloat(String(value)) / 100, loan.effectiveRate, loan.years, loan.months, loan.monthsDelayed, loan.startMonths, loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'years') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, loan.effectiveRate, parseInt(String(value)), loan.months, loan.monthsDelayed, loan.startMonths, loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'months') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, loan.effectiveRate, loan.years, parseInt(String(value)), loan.monthsDelayed, loan.startMonths, loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'monthsDelayed') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, loan.effectiveRate, loan.years, loan.months, parseInt(String(value)), loan.startMonths, loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'color') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, loan.effectiveRate, loan.years, loan.months, loan.monthsDelayed, loan.startMonths, String(value), loan.downPayment, loan.stockSourceId);
  if (field === 'rateType') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, value === 'effective', loan.years, loan.months, loan.monthsDelayed, loan.startMonths, loan.color, loan.downPayment, loan.stockSourceId);
  if (field === 'downPayment') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, loan.effectiveRate, loan.years, loan.months, loan.monthsDelayed, loan.startMonths, loan.color, parseFloat(String(value)), loan.stockSourceId);
  if (field === 'stockSourceId') return new Loan(loan.id, loan.name, loan.principal, loan.yearlyRate, loan.effectiveRate, loan.years, loan.months, loan.monthsDelayed, loan.startMonths, loan.color, loan.downPayment, (String(value) || null));
  return inv;
}
