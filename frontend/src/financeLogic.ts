import { Loan, type LoanSchedule, Stock, Property } from './models';

export interface MonthlyPlan {
  loans: LoanPaymentPlan[]; // payment per loan
  stockInvestments: AssetPaymentPlan[]; // total invested in stocks
  propertyInvestments: AssetPaymentPlan[]; // Total invested in property
}

export interface LoanPaymentPlan {
  loanName: string,
  monthlyCost: number,
  totalCost: number,
  principals: number[],
  ratePayments: number[],
}

export interface AssetPaymentPlan {
  assetName: string,
  totalValues: number[],
  taxedValues: number[],
}

function totalLoanCost(sch: LoanSchedule): number {
  const principalSum = sch.principalPaid.reduce((a, v) => a + v, 0);
  const interestSum  = sch.interestPaid .reduce((a, v) => a + v, 0);
  return principalSum + interestSum;
  // mathematically identical to: monthlyPayment * numberOfPayments
}

/**
 * Distributes monthly income between loan payments and stock investments.
 * @param income - The monthly personal income
 * @param loans - Array of Loan objects
 * @param stocks - Array of Stock objects
 * @param months - Number of months to simulate
 * @returns Array of MonthlyPlan objects, one per month
 */
export function calculateMonthlyPlan(
  income: number,
  loans: Loan[],
  stocks: Stock[],
  properties: Property[],
  months: number,
  yearlyInflation: number,
): MonthlyPlan {

  /* --------------- PASS 0: overall timeline length --------------- */
  const maxDelayed = loans.length ? Math.max(...loans.map(l => l.monthsDelayed)) : 0;
  const totalMonths = months + maxDelayed;

  /* --------------- PASS 1: aggregate loan cash-flows ------------- */
  const principalOut = new Array<number>(totalMonths).fill(0);
  const interestOut  = new Array<number>(totalMonths).fill(0);

  const plans: MonthlyPlan = {
    loans: [],
    stockInvestments: [],
    propertyInvestments: [],
  };

  loans.forEach(loan => {
    const sch = loan.getSchedule(totalMonths);

    /* element-wise accumulate */
    sch.principalPaid.forEach((v, i) => principalOut[i] += v);
    sch.interestPaid .forEach((v, i) => interestOut [i] += v);

    plans.loans.push({
      loanName:   loan.name,
      monthlyCost: 0,                 // kept only for UI – not used in math
      totalCost: totalLoanCost(sch),
      principals: sch.balances,
      ratePayments: sch.interestPaid,
    });
  });

  /* --------------- PASS 2: build investable income --------------- */

  const yearlyIncomes = Array.from({ length: totalMonths }, (_, m) =>
    // yearly bump → floor(m / 12)
    income * (1 + yearlyInflation) ** Math.floor(m / 12));

  const TAX_RATE = 0.22;
  const investable = interestOut.map((intPaid, i) =>
    yearlyIncomes[i]                      // salary
    - (principalOut[i] + intPaid) // cash actually sent to lender
    + intPaid * TAX_RATE          // tax shield only on PAID interest
  );

  /* --------------- PASS 3: project assets ------------------------ */
  if (stocks.length) {
    const s = stocks[0];
    plans.stockInvestments.push({
      assetName:   s.name,
      totalValues: s.projectedValue(totalMonths, false, investable),
      taxedValues: s.projectedValue(totalMonths, true,  investable),
    });
  }

  properties.forEach(p => {
    plans.propertyInvestments.push({
      assetName:   p.name,
      totalValues: p.projectedValue(totalMonths, false, new Array(totalMonths).fill(0)),
      taxedValues: p.projectedValue(totalMonths, true,  new Array(totalMonths).fill(0)),
    });
  });

  return plans;
}