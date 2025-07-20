// Common models for the investment planner
export interface LoanSchedule {
  /* Arrays have identical length = totalMonths.
     Index 0 means “end of month 0” (today → next month). */
  balances:      number[];   // running balance
  principalPaid: number[];   // out-going principal that month
  interestPaid:  number[];   // out-going interest  "
}

export abstract class Asset {
  id: string;
  name: string;
  initialValue: number;
  currentValue: number;
  yearlyIncrease: number; // e.g., 0.07 for 7%
  monthlyIncrease: number; // e.g., 0.05 for 5%
  taxRate: number;        // e.g., 0.22 for 22%
  color: string;

  constructor(id: string, name: string, initialValue: number, yearlyIncrease: number, taxRate: number, color: string) {
    this.id = id;
    this.name = name;
    this.initialValue = initialValue;
    this.currentValue = initialValue;
    this.yearlyIncrease = yearlyIncrease;
    this.monthlyIncrease = Math.pow(1 + yearlyIncrease, 1/12) - 1;
    this.taxRate = taxRate;
    this.color = color;
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
  constructor(id: string, name: string, initialValue: number, expectedReturn: number, taxRate: number, color: string) {
    super(id, name, initialValue, expectedReturn, taxRate, color);
  }
}

export class Stock extends Asset {

  constructor(id: string, name: string, initialValue: number, expectedReturn: number, taxRate: number, color: string) {
    super(id, name, initialValue, expectedReturn, taxRate, color);
  }
}

export class Loan {
  id: string;
  name: string;
  principal: number;
  effectiveInterestRate: number; // e.g., 0.05 for 5%
  monthlyInterestRate: number; // e.g., 0.05 for 5%
  years: number;
  monthsDelayed: number;
  color: string;

  constructor(id: string, name: string, principal: number, effectiveInterestRate: number, years: number, monthsDelayed: number = 0, color: string) {
    this.id = id;
    this.name = name;
    this.principal = principal;
    this.effectiveInterestRate = effectiveInterestRate;
    this.monthlyInterestRate = Math.pow(1 + effectiveInterestRate, 1/12) - 1;
    this.years = years;
    this.monthsDelayed = monthsDelayed;
    this.color = color;
  }

  calculateMonthlyPayment(years: number, monthsDelayed: number, raisedPrincipal?: number): number {
    const monthlyInterestRate = this.monthlyInterestRate
    let balance = this.principal
    if (raisedPrincipal) {
      balance = raisedPrincipal
    }

    for (let i = 0; i < monthsDelayed; i++) {
      balance += balance * monthlyInterestRate;
    }
    const n = years * 12 - monthsDelayed;
    if (n <= 0) return 0;
    if (monthlyInterestRate === 0) return balance / n;
    return (balance * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -n));
  }

  loanValue(months: number, monthsDelayed: number = this.monthsDelayed): [number[], number[]] {
    const principals = [this.principal];
    const ratePayments = [0];

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
    const monthlyPayment = this.calculateMonthlyPayment(this.years, 0, balance);

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

  /**
   * Return monthly cash-flows *aligned* to `totalMonths`.
   * Months before the loan starts amortising are padded with zeros.
   */
  getSchedule(totalMonths: number): LoanSchedule {
    const balances      = new Array<number>(totalMonths + 1).fill(0); // +1 so last item is closing balance
    const principalPaid = new Array<number>(totalMonths).fill(0);
    const interestPaid  = new Array<number>(totalMonths).fill(0);

    /* Step 1 – capitalise interest during the deferment window
       (no cash leaves your pocket yet).                           */
    let balance = this.principal;
    balances[0] = balance;

    for (let m = 0; m < this.monthsDelayed && m < totalMonths; m++) {
      balance += balance * this.monthlyInterestRate;
      balances[m + 1] = balance;
      /* nothing booked to principalPaid / interestPaid */
    }

    /* Step 2 – level payment once amortisation starts   */
    const payMonths     = Math.max(totalMonths - this.monthsDelayed, 0);
    const monthlyPmt    = this.calculateMonthlyPayment(this.years, 0, balance);

    for (let k = 0; k < payMonths; k++) {
      const idx       = this.monthsDelayed + k;
      const interest  = balance * this.monthlyInterestRate;
      const principal = Math.min(monthlyPmt - interest, balance);

      interestPaid[idx]  = interest;
      principalPaid[idx] = principal;

      balance           -= principal;
      balances[idx + 1]  = balance;
      if (balance <= 0) break;   // early payoff guard
    }

    /* If loan fully repaid early, balances stay 0 afterwards */
    return { balances, principalPaid, interestPaid };
  }

} 