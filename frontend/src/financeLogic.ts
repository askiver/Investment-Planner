import { Loan, Stock, Property } from './models';

export interface MonthlyPlan {
  loans: LoanPaymentPlan[]; // payment per loan
  stockInvestments: AssetPaymentPlan[]; // total invested in stocks
  propertyInvestments: AssetPaymentPlan[]; // Total invested in property
}

export interface LoanPaymentPlan {
  loanName: string,
  monthlyCost: number,
  principals: number[],
  ratePayments: number[],
}

export interface AssetPaymentPlan {
  assetName: string,
  totalValues: number[],
  taxedValues: number[],
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
): MonthlyPlan {

  const plans: MonthlyPlan = {
    loans: [],
    stockInvestments: [],
    propertyInvestments: [],
  };

  let monthlyCostLoans = 0
  const ratePaymentsLength = months + 1
  const ratePaymentsSums = new Array<number>(ratePaymentsLength).fill(0);

  loans.forEach((loan) => {

    const [loanPrincipals, loanRatePayments] = loan.loanValue(months, loan.monthsDelayed)

    const loanPlan: LoanPaymentPlan = {
      loanName: loan.name,
      monthlyCost: loan.calculateMonthlyPayment(months/12, loan.monthsDelayed),
      principals:loanPrincipals,
      ratePayments:loanRatePayments
    }
    plans.loans.push(loanPlan)

    for (let i = 0; i < ratePaymentsLength; i++) {
      ratePaymentsSums[i] += loanRatePayments[i]
    }
    monthlyCostLoans += loanPlan.monthlyCost
  })

  const remainingIncome = income - monthlyCostLoans
  const investableIncome = ratePaymentsSums.map(v => remainingIncome + v * 0.22);
  

  if (stocks.length > 0) {
    const stock = stocks[0]
    
    const valuesBeforeTax = stock.projectedValue(months, false, investableIncome)
    const valuesAfterTax = stock.projectedValue(months, true, investableIncome)

    const stockPlan: AssetPaymentPlan = {
      assetName: stock.name,
      totalValues: valuesBeforeTax,
      taxedValues: valuesAfterTax,
    }

    plans.stockInvestments.push(stockPlan)

  }

  properties.forEach((property) => {
    const valuesBeforeTax = property.projectedValue(months, false, new Array(months).fill(0))
    const valuesAfterTax = property.projectedValue(months, true, new Array(months).fill(0))

    const properyPlan: AssetPaymentPlan = {
      assetName: property.name,
      totalValues: valuesBeforeTax,
      taxedValues: valuesAfterTax,
    }

    plans.propertyInvestments.push(properyPlan)
  })
  return plans;
} 