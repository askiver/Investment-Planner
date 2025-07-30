import { Loan, Stock, Property } from './models';

export interface MonthlyPlan {
  loans: LoanPaymentPlan[]; // payment per loan
  stockInvestments: AssetPaymentPlan[]; // total invested in stocks
  propertyInvestments: AssetPaymentPlan[]; // Total invested in property
  stockSellOffs?: Record<string, number[]>; // Track stock selloffs by stock ID
}

export interface LoanPaymentPlan {
  loanName: string,
  monthlyCost: number,
  totalCost: number,
  principals: number[],   // Running balances for each month
  ratePayments: number[], // Interest paid each month
  principalPayments?: number[], // Principal paid each month (calculated from the loan schedule)
}

export interface AssetPaymentPlan {
  assetName: string,
  totalValues: (number | undefined)[],
  taxedValues: (number | undefined)[],
}
/**
function totalLoanCost(sch: LoanSchedule): number {
  const principalSum = sch.principalPaid.reduce((a, v) => a + v, 0);
  const interestSum  = sch.interestPaid .reduce((a, v) => a + v, 0);
  return principalSum + interestSum;
  // mathematically identical to: monthlyPayment * numberOfPayments
}
    */

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
  const maxLoanStart = loans.length ? Math.max(...loans.map(l => l.startMonths + l.monthsDelayed)) : 0;
  const maxAssetStart = [...stocks, ...properties].length ?
    Math.max(...[...stocks, ...properties].map(a => a.startMonths)) : 0;
  const totalMonths = Math.max(months, months + maxLoanStart, months + maxAssetStart);

  /* --------------- PASS 1: calculate stock sell-offs for loan down payments ------------- */
  const stockSellOffs: Record<string, number[]> = {};

  // Initialize selloff arrays for each stock
  stocks.forEach(stock => {
    stockSellOffs[stock.id] = new Array<number>(totalMonths).fill(0);
  });

  // Calculate down payment amounts and create sell-off plans
  loans.forEach(loan => {
    if (loan.downPaymentPercentage > 0 && loan.stockSourceId) {
      const downPaymentAmount = loan.principal * (loan.downPaymentPercentage / 100);

      // Add the down payment amount to the sell-off at the loan start month
      if (stockSellOffs[loan.stockSourceId]) {
        stockSellOffs[loan.stockSourceId][loan.startMonths] += downPaymentAmount;
      }
    }
  });

  /* --------------- PASS 2: aggregate loan cash-flows ------------- */
  const principalOut = new Array<number>(totalMonths).fill(0);
  const interestOut  = new Array<number>(totalMonths).fill(0);

  const plans: MonthlyPlan = {
    loans: [],
    stockInvestments: [],
    propertyInvestments: [],
    stockSellOffs
  };

  loans.forEach(loan => {
    const sch = loan.getSchedule(totalMonths);

    /* element-wise accumulate */
    sch.principalPaid.forEach((v, i) => principalOut[i] += v);
    sch.interestPaid .forEach((v, i) => interestOut [i] += v);

    plans.loans.push({
      loanName:   loan.name,
      monthlyCost: 0,                 // kept only for UI – not used in math
      totalCost: loan.monthlyPayment * loan.totalMonths,
      principals: sch.balances,
      ratePayments: sch.interestPaid,
      principalPayments: sch.principalPaid,
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
  // Handle all stock investments
  stocks.forEach(stock => {
    const sellOffs = stockSellOffs[stock.id] || new Array<number>(totalMonths).fill(0);
    plans.stockInvestments.push({
      assetName:   stock.name,
      totalValues: stock.projectedValue(totalMonths, false, investable, sellOffs),
      taxedValues: stock.projectedValue(totalMonths, true,  investable, sellOffs),
    });
  });

  // Handle all property investments
  properties.forEach(property => {
    plans.propertyInvestments.push({
      assetName:   property.name,
      totalValues: property.projectedValue(totalMonths, false),
      taxedValues: property.projectedValue(totalMonths, true),
    });
  });

  return plans;
}