
export type InvestmentType = 'Property' | 'Stock' | 'Loan' | 'Student Loan';

export type RateType = 'effective' | 'nominal';

export type BaseForm = {
  name: string;
  startMonths: string;  // keep as string in UI; convert in builder
  color: string;
  rateType: RateType;
};

export type PropertyFormValues = BaseForm & {
  initialValue: string;
  currentValue: string;
  expectedReturn: string; // %
  taxRate: string;        // %
};

export type StockFormValues = BaseForm & {
  initialValue: string;
  currentValue: string;
  expectedReturn: string; // %
  taxRate: string;        // %
};

export type LoanFormValues = BaseForm & {
  principal: string;
  effectiveInterestRate: string; // %
  years: string;
  months: string;        // optional extra months
  monthsDelayed: string; // grace/deferment
  downPayment: string;
  stockSourceId: string; // '' or id
};

export type StudentLoanFormValues = BaseForm & {
  principal: string;
  effectiveInterestRate: string; // %
  years: string;
  months: string;
  monthsDelayed: string;
};
