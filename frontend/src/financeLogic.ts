import { Loan, Stock, Property, Asset } from './models';

export interface MonthlyPlan {
  loans: LoanPaymentPlan[]; // payment per loan
  stockInvestments: AssetPaymentPlan[]; // total invested in stocks
  propertyInvestments: AssetPaymentPlan[]; // Total invested in property
  stockSellOffs?: Record<string, number[]>; // Track stock selloffs by stock ID
  netWorth: number[];
  netWorthTaxed: number[];
}

export interface LoanPaymentPlan {
  loan: Loan,
  totalCost: number,
  principals: (number | undefined)[],   // Running balances for each month
  ratePayments: (number | undefined)[], // Interest paid each month
  principalPayments: (number | undefined)[], // Principal paid each month (calculated from the loan schedule)
}

export interface AssetPaymentPlan {
  asset: Asset,
  totalValues: (number | undefined)[],
  taxedValues: (number | undefined)[],
  investedValues?: (number | undefined)[], // Optional, if the asset can be invested in
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
  const totalMonths = months + 1; // Add +1 to account for month 0

  // Add +1 to account for month 0
  const netWorth = new Array<number>(totalMonths).fill(0);
  const netWorthTaxed = new Array<number>(totalMonths).fill(0);

  /* --------------- PASS 1: calculate stock sell-offs for loan down payments ------------- */
  const stockSellOffs: Record<string, number[]> = {};

  // Initialize selloff arrays for each stock
  stocks.forEach(stock => {
    stockSellOffs[stock.id] = new Array<number>(totalMonths).fill(0);
  });

  // Calculate down payment amounts and create sell-off plans
  loans.forEach(loan => {
    if (loan.downPayment > 0 && loan.stockSourceId) {
      const downPaymentAmount = loan.downPayment;

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
    stockSellOffs,
    netWorth,
    netWorthTaxed,
  };

  loans.forEach(loan => {
    const sch = loan.getSchedule(totalMonths);

    /* element-wise accumulate */
    sch.principalPaid.forEach((v, i) => principalOut[i] += v);
    sch.interestPaid .forEach((v, i) => interestOut [i] += v);

    // Add loan principal to net worth
    sch.balances.forEach((v, i) => netWorth[i] -= (v ?? 0));
    sch.balances.forEach((v,i) => netWorthTaxed[i] -= (v ?? 0))

    plans.loans.push({
      loan:   loan,
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
    // Create individualized invested values for this stock
    const stockInvestedValues = investable.map(val => val / Math.max(1, stocks.length));

    const stockValues = stock.projectedValue(totalMonths, false, stockInvestedValues, sellOffs);
    const stockValuesTaxed = stock.projectedValue(totalMonths, true, stockInvestedValues, sellOffs);

    // Add to net worth
    stockValues.forEach((v, i) => netWorth[i] += (v ?? 0));
    stockValuesTaxed.forEach((v, i) => netWorthTaxed[i] += (v ?? 0));

    plans.stockInvestments.push({
      asset:   stock,
      totalValues: stockValues,
      taxedValues: stockValuesTaxed,
      investedValues: stockInvestedValues
    });
  });

  // Handle all property investments
  properties.forEach(property => {
    
    const propertyValues = property.projectedValue(totalMonths, false);
    const propertyValuesTaxed = property.projectedValue(totalMonths, true);
    
    // Add to net worth
    propertyValues.forEach((v, i) => netWorth[i] += (v ?? 0));
    propertyValuesTaxed.forEach((v, i) => netWorthTaxed[i] += (v ?? 0));
    
    plans.propertyInvestments.push({
      asset:   property,
      totalValues: propertyValues,
      taxedValues: propertyValuesTaxed,
    });
  });

  return plans;
}