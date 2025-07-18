// Common models for the investment planner

export abstract class Asset {
  id: string;
  name: string;
  initialValue: number;
  currentValue: number;
  yearlyIncrease: number; // e.g., 0.07 for 7%
  monthlyIncrease: number; // e.g., 0.05 for 5%
  taxRate: number;        // e.g., 0.22 for 22%

  constructor(id: string, name: string, initialValue: number, yearlyIncrease: number, taxRate: number) {
    this.id = id;
    this.name = name;
    this.initialValue = initialValue;
    this.currentValue = initialValue;
    this.yearlyIncrease = yearlyIncrease;
    this.monthlyIncrease = Math.pow(1 + yearlyIncrease, 1/12) - 1;
    this.taxRate = taxRate;
  }

  // Method for calculating the value of the asset after n months
  projectedValue(months: number, tax: boolean, monthlyInvestment: number): number[] {
    const values = [];
    let value = this.initialValue;
    let insertedValue = this.initialValue
    let taxAmount = 0;
    values.push(value);
    for (let i = 0; i < months; i++) {
      value = value * (1 + this.monthlyIncrease) + monthlyInvestment;
      insertedValue += monthlyInvestment
      if (tax) {
        taxAmount = (value - insertedValue) * this.taxRate;
        values.push(value - taxAmount)
      }
      else {
        values.push(value);
      }
    }
    return values;
  }
}

export class Property extends Asset {
  primaryResidence: boolean;

  constructor(id: string, name: string, initialValue: number, expectedReturn: number, taxRate: number, primaryResidence: boolean) {
    super(id, name, initialValue, expectedReturn, taxRate);
    this.primaryResidence = primaryResidence;
  }
}

export class Stock extends Asset {
  monthlyInvestment : number

  constructor(id: string, name: string, initialValue: number, expectedReturn: number, taxRate: number, monthlyInvestment: number) {
    super(id, name, initialValue, expectedReturn, taxRate);
    this.monthlyInvestment = monthlyInvestment
  }
}

export class Loan {
  id: string;
  name: string;
  principal: number;
  nominalInterestRate: number; // e.g., 0.05 for 5%
  monthlyInterestRate: number; // e.g., 0.05 for 5%
  years: number;
  monthsDelayed: number;

  constructor(id: string, name: string, principal: number, nominalInterestRate: number, years: number, monthsDelayed: number = 0) {
    this.id = id;
    this.name = name;
    this.principal = principal;
    this.nominalInterestRate = nominalInterestRate;
    this.monthlyInterestRate = nominalInterestRate / 12;
    this.years = years;
    this.monthsDelayed = monthsDelayed;
  }

  static calculateMonthlyPayment(principal: number, nominalInterestRate: number, years: number, monthsDelayed: number): number {
    const monthlyInterestRate = nominalInterestRate / 12;
    let balance = principal;
    for (let i = 0; i < monthsDelayed; i++) {
      balance += balance * monthlyInterestRate;
    }
    const n = years * 12 - monthsDelayed;
    if (n <= 0) return 0;
    if (monthlyInterestRate === 0) return balance / n;
    return (balance * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -n));
  }

  loanValue(months: number, monthsDelayed: number = this.monthsDelayed): [number[], number[]] {
    const principals = [];
    const ratePayments = [];

    let balance = this.principal;
    let interestPayment = 0;

    // Accumulate interest during delay
    for (let i = 0; i < monthsDelayed; i++) {
      interestPayment = balance * this.monthlyInterestRate;
      balance += interestPayment;
      principals.push(balance);
      ratePayments.push(interestPayment);
    }

    // Recalculate payment for remaining term
    const n = this.years * 12 - monthsDelayed;
    const monthlyPayment = Loan.calculateMonthlyPayment(balance, this.nominalInterestRate, this.years, 0);

    // Amortization after delay
    for (let i = 0; i < months; i++) {
      interestPayment = balance * this.monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(balance - principalPayment, 0);
      principals.push(balance);
      ratePayments.push(interestPayment);
    }
    return [principals, ratePayments];
  }
} 