// Common models for the investment planner
  /**
   * Represents the schedule of a loan's payments and balances over time
   */
export interface LoanSchedule {
  /* Arrays have identical length = totalMonths.
     Index 0 means “end of month 0” (today → next month). */
  balances:      number[];   // running balance
  principalPaid: number[];   // out-going principal that month
  interestPaid:  number[];   // out-going interest  "
}

function calculateMonthlyIncrease(yearlyRate: number, effectiveRate: boolean): number {
  if (effectiveRate) return Math.pow(1 + yearlyRate, 1/12) - 1;
  else return yearlyRate/12;
}

export abstract class Asset {
  id: string;
  name: string;
  startMonths: number;
  initialValue: number;
  currentValue: number;
  yearlyRate: number; // e.g., 0.07 for 7%
  monthlyIncrease: number; // e.g., 0.05 for 5%
  taxRate: number;        // e.g., 0.22 for 22%
  color: string;
  effectiveRate: boolean;

  constructor(id: string, name: string, startMonths: number, initialValue: number, currentValue: number, yearlyRate: number, effectiveRate: boolean, taxRate: number, color: string) {
    this.id = id;
    this.name = name;
    this.startMonths = startMonths;
    this.initialValue = initialValue;
    this.currentValue = currentValue;
    this.yearlyRate = yearlyRate;
    this.monthlyIncrease = calculateMonthlyIncrease(yearlyRate, effectiveRate);
    this.taxRate = taxRate;
    this.color = color;
    this.effectiveRate = effectiveRate;
  }

}

export class Property extends Asset {
  constructor(id: string, name: string, startMonths: number, initialValue: number, currentValue: number, yearlyRate: number, effectiveRate: boolean, taxRate: number, color: string) {
    super(id, name, startMonths, initialValue, currentValue, yearlyRate, effectiveRate, taxRate, color);
  }

  // Method for calculating the value of the asset after n months
  projectedValue(months: number, tax: boolean): (number | undefined)[] {
    const values: (number | undefined)[] = [];
    let value = 0; // Start with 0 until start month
    let insertedValue = 0;

    // Need to push undefined at month 0 since we properly handle the start month

    for (let i = 0; i < months; i++) {
      if (i < this.startMonths) {
        // Before start month, asset doesn't exist
        values.push(undefined);
        continue
      }
      if (i === this.startMonths) {
        // At start month, initialize with current value
      value = this.currentValue
      insertedValue = this.initialValue;
      }
      else {
        value *= (1 + this.monthlyIncrease)
      }
      const monthAmount = tax ? (value - (value-insertedValue) * (this.taxRate)) : value;
      values.push(monthAmount);
    }
    return values;
  }
}

export class Stock extends Asset {
  constructor(id: string, name: string, startMonths: number, initialValue: number, currentValue: number, yearlyRate: number, effectiveRate: boolean, taxRate: number, color: string) {
    super(id, name, startMonths, initialValue, currentValue, yearlyRate, effectiveRate, taxRate, color);
  }
  // Method for calculating the value of the asset after n months
  projectedValue(months: number, tax: boolean, monthlyInvestments: number[], sellOffs: number[]): (number | undefined)[] {
    const values: (number | undefined)[] = [];
    let value = 0; // Start with 0 until start month
    let insertedValue = 0;

    for (let i = 0; i < months; i++) {
      if (i < this.startMonths) {
        // Before start month, asset doesn't exist
        values.push(undefined);
        continue
      }
      if (i === this.startMonths) {
      // At start month, initialize with current value
      // For now, do not consider monthly investments the first month
      value = this.currentValue;
      insertedValue = this.initialValue;
      } else {
      // After start month, normal growth
      value = value * (1 + this.monthlyIncrease) + monthlyInvestments[i];
      insertedValue += monthlyInvestments[i];
    }

    // Handle sell-offs
    // First check if anything is to be sold off
      if (sellOffs[i] > insertedValue) {
        const remainingSellOff = sellOffs[i] - insertedValue;
        value -= (insertedValue + (1+this.taxRate)* remainingSellOff)
        insertedValue = 0
      }
      else {
        value -= sellOffs[i]
        insertedValue -= sellOffs[i]
      }
      // Calculate the value after tax if applicable
      const monthAmount = tax ? (value - (value-insertedValue) * (this.taxRate)) : value;
      values.push(monthAmount);
    }
    return values;
  }
}

export class Loan {
  readonly id: string;
  name: string;
  principal: number;
  yearlyRate: number; // e.g., 0.05 for 5%
  private readonly monthlyInterestRate: number; // e.g., 0.05 for 5%
  monthlyPayment: number;
  years: number;
  months: number;
  totalMonths: number;
  monthsDelayed: number;
  startMonths: number;
  color: string;
  effectiveRate: boolean;
  downPayment: number;
  stockSourceId: string | null;

  constructor(id: string, name: string, principal: number, yearlyRate: number, effectiveRate: boolean, years: number, months: number, monthsDelayed: number = 0, startMonths: number = 0, color: string, downPayment: number = 0, stockSourceId: string | null = null) {
    this.id = id;
    this.name = name;
    this.yearlyRate = yearlyRate;
    this.years = years;
    this.months = months; // Initialize months
    this.totalMonths = years * 12 + months;
    this.monthsDelayed = monthsDelayed;
    this.startMonths = startMonths;
    this.downPayment = downPayment;
    this.principal = principal
    this.monthlyInterestRate = calculateMonthlyIncrease(yearlyRate, effectiveRate);
    this.monthlyPayment = this.calculateMonthlyPayment();
    this.color = color;
    this.effectiveRate = effectiveRate;
    this.stockSourceId = stockSourceId
  }

  calculateMonthlyPayment(): number {
    let balance = this.principal;
    let interestPayment = 0;

    // Find new balance if loan is delayed
    for (let i = 0; i < this.monthsDelayed; i++) {
      interestPayment = balance * this.monthlyInterestRate;
      balance += interestPayment;
    }

    const months = this.totalMonths
    if (months <= 0) return 0;
    if (this.monthlyInterestRate === 0) return balance / months;
    return (balance * this.monthlyInterestRate) / (1 - Math.pow(1 + this.monthlyInterestRate, -months));
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
    // 1) Initialize arrays with zeros - loan doesn't exist before start month
    const balances = new Array<number>(totalMonths).fill(0);
    const principalPaid = new Array<number>(totalMonths).fill(0);
    const interestPaid  = new Array<number>(totalMonths).fill(0);

    // If loan hasn't started yet, return empty schedule
    if (this.startMonths >= totalMonths) {
      return { balances, principalPaid, interestPaid };
    }

    // 2) Start the loan at the designated start month
    let balance = this.principal;
    balances[this.startMonths] = balance;

    // 3) Roll balance through the deferment months (after start month)
    const defermentEnd = this.startMonths + this.monthsDelayed;
    for (let m = this.startMonths; m < defermentEnd && m < totalMonths; m++) {
      balance += balance * this.monthlyInterestRate;
      balances[m] = balance;
    }
  
    // 4) Compute payment for the amortization period
    const n = this.totalMonths;
    const monthlyPmt = Loan.annuity(balance, this.monthlyInterestRate, n);
    this.monthlyPayment = monthlyPmt;

    // 5) Amortize the loan
    const amortizationStart = this.startMonths + this.monthsDelayed;
    for (let k = 1; k < n && amortizationStart + k < totalMonths; k++) {
      const idx = amortizationStart + k;
      const interest = balance * this.monthlyInterestRate;
      const principal = Math.min(monthlyPmt - interest, balance);

      interestPaid[idx] = interest;
      principalPaid[idx] = principal;
  
      balance -= principal;
      balances[idx] = balance;
      if (balance === 0) break;
    }
  
    return { balances, principalPaid, interestPaid };
  }
}

export class StudentLoan extends Loan {
  constructor(id:string, name: string, principal: number, yearlyRate: number, effectiveRate: boolean, years: number, months: number, monthsDelayed: number = 0, startMonths: number = 0, color: string,) {
    // Student loans are a specific type of loan with no down payment
    super(id, name, principal, yearlyRate, effectiveRate, years, months, monthsDelayed, startMonths, color, 0, null);
  }
}
