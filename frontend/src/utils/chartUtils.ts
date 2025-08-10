import { Property, Stock, Loan } from '../models';
import type { MonthlyPlan } from '../financeLogic';

export type ChartData = {
  data: Record<string, number>[];
  assetKeys: string[];
  loanKeys: string[];
};

/**
 * Prepare data for stacked area chart (pre-tax or post-tax)
 */
export const getChartData = (
  useTaxed: boolean,
  plan: MonthlyPlan,
  properties: Property[],
  stocks: Stock[],
  loans: Loan[],
  timelineYears: number
): ChartData => {
  const data: Record<string, number>[] = [];
  const maxMonths = timelineYears * 12 + 1;

  for (let m = 0; m <= maxMonths; m++) {
    const entry: Record<string, number> = { month: m };
    let runningTotal = 0;
    let loanTotal = 0;

    // Properties - only include if they have started and have defined values
    plan.propertyInvestments.forEach(propertyPlan => {
      const property = properties.find(p => p.name === propertyPlan.asset.name);
      const val = useTaxed ? propertyPlan.taxedValues[m] : propertyPlan.totalValues[m];
      // Only include in chart if the property has started (val is not undefined) and has value > 0
      if (property && val !== undefined && val > 0) {
        entry[propertyPlan.asset.name] = val;
        runningTotal += val;
      }
    });

    // Stocks - only include if they have started and have defined values
    plan.stockInvestments.forEach(stockPlan => {
      const stock = stocks.find(s => s.name === stockPlan.asset.name);
      const val = useTaxed ? stockPlan.taxedValues[m] : stockPlan.totalValues[m];
      // Only include in chart if the stock has started (val is not undefined) and has value > 0
      if (stock && val !== undefined && val > 0) {
        entry[stockPlan.asset.name] = val;
        runningTotal += val;
      }
    });

    // Loans - only include if they have started and have non-zero principal
    plan.loans.forEach(loanPlan => {
      const loan = loans.find(l => l.name === loanPlan.loan.name);
      const principal = loanPlan.principals[m] ?? 0;
      // Only include in chart if the loan has started (m >= startMonths) and has principal
      if (loan && m >= loan.startMonths && principal > 0) {
        entry[loanPlan.loan.name] = -principal; // Negative for stacking below x-axis
        loanTotal += principal;
      }
    });

    entry['Total'] = runningTotal - loanTotal;
    data.push(entry);
  }

  // Get property names that appear in the data
  const propertyNames = plan.propertyInvestments
    .map(p => p.asset.name)
    .filter(name => data.some(entry => entry[name] !== undefined && entry[name] > 0));

  // Get stock names that appear in the data
  const stockNames = plan.stockInvestments
    .map(s => s.asset.name)
    .filter(name => data.some(entry => entry[name] !== undefined && entry[name] > 0));

  // Order assets with properties first, then stocks
  const assetKeys = [...propertyNames, ...stockNames];

  const loanKeys = plan.loans
    .map(l => l.loan.name)
    .filter(name => data.some(entry => entry[name] !== undefined && entry[name] < 0));

  return { data, assetKeys, loanKeys };
};
