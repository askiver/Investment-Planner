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
  projectedValue(months: number, tax: boolean): number[] {
    const values = [];
    let value = this.initialValue;
    let taxAmount = 0;
    values.push(value);
    for (let i = 0; i < months; i++) {
      value = value * (1 + this.monthlyIncrease);
      if (tax) {
        taxAmount = (value - this.initialValue) * this.taxRate;
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

  constructor(id: string, name: string, initialValue: number, expectedReturn: number, taxRate: number) {
    super(id, name, initialValue, expectedReturn, taxRate);
  }
}

export class Loan {
  id: string;
  name: string;
  principal: number;
  nominalInterestRate: number; // e.g., 0.05 for 5%
  monthlyInterestRate: number; // e.g., 0.05 for 5%
  years: number;
  studentLoan: boolean;
  monthlyPayment: number;

  constructor(id: string, name: string, principal: number, nominalInterestRate: number, years: number, studentLoan: boolean) {
    this.id = id;
    this.name = name;
    this.principal = principal;
    this.nominalInterestRate = nominalInterestRate;
    this.monthlyInterestRate = nominalInterestRate / 12;
    this.monthlyPayment = this.calculateMonthlyPayment();
    this.years = years;
    this.studentLoan = studentLoan;
  }

  calculateMonthlyPayment(): number {
    const n = this.years * 12;
    const r = this.monthlyInterestRate;
    const P = this.principal;
    return (P*r)/(1-Math.pow(1+r, -n));
  }

  


} 