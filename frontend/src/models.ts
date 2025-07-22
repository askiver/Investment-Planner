// Common models for the investment planner
export interface LoanSchedule {
  /* Arrays have identical length = totalMonths.
     Index 0 means “end of month 0” (today → next month). */
  balances:      number[];   // running balance
  principalPaid: number[];   // out-going principal that month
  interestPaid:  number[];   // out-going interest  "
}

function calculateMonthlyIncrease(yearlyRate: number, effectiveRate: boolean): number {
  if (effectiveRate) {
    return Math.pow(1 + yearlyRate, 1/12) - 1;
  }
  else {
    return yearlyRate/12
  }
}

export abstract class Asset {
  id: string;
  name: string;
  initialValue: number;
  currentValue: number;
  yearlyRate: number; // e.g., 0.07 for 7%
  monthlyIncrease: number; // e.g., 0.05 for 5%
  taxRate: number;        // e.g., 0.22 for 22%
  color: string;
  effectiveRate: boolean;

  constructor(id: string, name: string, initialValue: number, yearlyRate: number, effectiveRate: boolean, taxRate: number, color: string) {
    this.id = id;
    this.name = name;
    this.initialValue = initialValue;
    this.currentValue = initialValue;
    this.yearlyRate = yearlyRate;
    this.monthlyIncrease = calculateMonthlyIncrease(yearlyRate, effectiveRate);
    this.taxRate = taxRate;
    this.color = color;
    this.effectiveRate = effectiveRate;
  }

  // Method for calculating the value of the asset after n months
  projectedValue(months: number, tax: boolean, monthlyInvestments: number[]): number[] {
    const values = [];
    let value = this.initialValue;
    let insertedValue = this.initialValue
    let taxAmount = 0;
    values.push(value);
    for (let i = 0; i < months; i++) {
      value = value * (1 + this.monthlyIncrease) + monthlyInvestments[i];
      insertedValue += monthlyInvestments[i]
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
  constructor(id: string, name: string, initialValue: number, yearlyRate: number, effectiveRate: boolean, taxRate: number, color: string) {
    super(id, name, initialValue, yearlyRate, effectiveRate, taxRate, color);
    this.effectiveRate = effectiveRate;
  }
}

export class Stock extends Asset {

  constructor(id: string, name: string, initialValue: number, yearlyRate: number, effectiveRate: boolean, taxRate: number, color: string) {
    super(id, name, initialValue, yearlyRate, effectiveRate, taxRate, color);
    this.effectiveRate = effectiveRate;
  }
}

export class Loan {
  readonly id: string;
  name: string;
  principal: number;
  yearlyRate: number; // e.g., 0.05 for 5%
  private readonly monthlyInterestRate: number; // e.g., 0.05 for 5%
  monthlyPayment: number;
  principals!: number[];
  ratePayments!: number[];
  years: number;
  monthsDelayed: number;
  color: string;
  effectiveRate: boolean;

  constructor(id: string, name: string, principal: number, yearlyRate: number, effectiveRate: boolean, years: number, monthsDelayed: number = 0, color: string) {
    this.id = id;
    this.name = name;
    this.principal = principal;
    this.yearlyRate = yearlyRate;
    this.years = years;
    this.monthsDelayed = monthsDelayed;
    this.monthlyInterestRate = calculateMonthlyIncrease(yearlyRate, effectiveRate);
    this.monthlyPayment = this.calculateMonthlyPayment();
    const [principals, ratepayments] = this.loanValue();
    this.principals = principals;
    this.ratePayments = ratepayments;
    this.color = color;
    this.effectiveRate = effectiveRate;

    this.calculateMonthlyPayment()
  }

  calculateMonthlyPayment(): number {

    let balance = this.principal
    let interestPayment = 0;

    // Find new balance if loan is delayed
    for (let i = 0; i < this.monthsDelayed; i++) {
      interestPayment = balance * this.monthlyInterestRate;
      balance += interestPayment;
    }

    const months = this.years * 12;
    if (months <= 0) return 0;
    else if (this.monthlyInterestRate === 0) return balance / months;
    return (balance * this.monthlyInterestRate) / (1 - Math.pow(1 + this.monthlyInterestRate, -months));
    
  }

  loanValue(): [number[], number[]] {
    const months = this.years * 12
    const principals = [this.principal];
    const ratePayments = [0];
    let balance = this.principal;
    let interestPayment = 0;

    // Accumulate interest during delay
    for (let i = 0; i < this.monthsDelayed; i++) {
      interestPayment = balance * this.monthlyInterestRate;
      balance += interestPayment;
      principals.push(balance);
      ratePayments.push(interestPayment);
    }

    // Recalculate payment for remaining term
    const monthlyPayment = this.monthlyPayment
    for (let i = 0; i < months; i++) {
      interestPayment = balance * this.monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(balance - principalPayment, 0);
      principals.push(balance);
      ratePayments.push(interestPayment);
    }
    return [principals, ratePayments];
  }

  /**
   * Return monthly cash-flows *aligned* to `totalMonths`.
   * Months before the loan starts amortising are padded with zeros.
   */
  private static annuity(balance: number, r: number, n: number): number {
    return n <= 0 ? 0
         : r === 0 ? balance / n
         : (balance * r) / (1 - Math.pow(1 + r, -n));
  }
  
  getSchedule(totalMonths: number): LoanSchedule {
    // 1) roll balance through the deferment months
    let balance = this.principal;
    const balances = new Array<number>(totalMonths + 1).fill(0);
    balances[0] = balance;
  
    for (let m = 0; m < this.monthsDelayed && m < totalMonths; m++) {
      balance += balance * this.monthlyInterestRate;
      balances[m + 1] = balance;
    }
  
    // 2) compute payment for the *remaining* months
    const n = this.years * 12 - this.monthsDelayed;      // 233 if delay = 7
    const monthlyPmt = Loan.annuity(balance, this.monthlyInterestRate, n);
    this.monthlyPayment = monthlyPmt;                    // keep for UI
  
    // 3) amortise
    const principalPaid = new Array<number>(totalMonths).fill(0);
    const interestPaid  = new Array<number>(totalMonths).fill(0);
  
    for (let k = 0; k < n && this.monthsDelayed + k < totalMonths; k++) {
      const idx      = this.monthsDelayed + k;
      const interest = balance * this.monthlyInterestRate;
      const principal= Math.min(monthlyPmt - interest, balance);
  
      interestPaid[idx]  = interest;
      principalPaid[idx] = principal;
  
      balance           -= principal;
      balances[idx + 1]  = balance;
      if (balance === 0) break;
    }
  
    return { balances, principalPaid, interestPaid };
  }
} 