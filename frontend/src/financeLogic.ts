import { Loan, Stock, Property } from './models/models';
import {WEALTH_TAX} from "@/models/constants";

export interface MonthlyPlan {
  loans: LoanPaymentPlan[]; // payment per loan
  stockInvestments: StockInvestmentPlan[]; // total invested in stocks
  propertyInvestments: PropertyInvestmentPlan[]; // Total invested in property
  stockSellOffs: Record<string, number[]>; // Track stock selloffs by stock ID
  netWorth: number[];
  netWorthTaxed: number[];
  wealth: number[];
  wealthTax: number[];
}

export interface LoanPaymentPlan {
  loan: Loan,
  totalCost: number,
  principals: number[],   // Running balances for each month
  ratePayments: number[], // Interest paid each month
  principalPayments: number[], // Principal paid each month (calculated from the loan schedule)
}

export interface StockInvestmentPlan{
  asset: Stock,
  totalValues: number[],
  taxedValues: number[],
  investedValues: number[], // Optional, if the asset can be invested in
}

export interface PropertyInvestmentPlan {
    asset: Property,
    totalValues: number[],
    taxedValues: number[],
}

function calculatePropertyValues(
    plan: MonthlyPlan,
    properties: Property[],
    totalMonths: number,
): void {
    // Handle all property investments
  properties.forEach(property => {

    const propertyValues = property.projectedValue(totalMonths, false);
    const propertyValuesTaxed = property.projectedValue(totalMonths, true);

    // Add to networth calculation
      propertyValues.forEach((v,i) => {
          plan.netWorth[i] += v;
          plan.netWorthTaxed[i] += propertyValuesTaxed[i];
      });

    plan.propertyInvestments.push({
      asset:   property,
      totalValues: propertyValues,
      taxedValues: propertyValuesTaxed,
    });
  });
}

function calculateLoanValues(
    plan: MonthlyPlan,
    loans: Loan[],
    totalMonths: number,
): [number[], number[]] {
    const principalOut = new Array<number>(totalMonths).fill(0);
    const interestOut  = new Array<number>(totalMonths).fill(0);
  loans.forEach(loan => {

    const sch = loan.getSchedule(totalMonths);

    /* element-wise accumulate */
    sch.principalPaid.forEach((v, i) => principalOut[i] += v);
    sch.interestPaid .forEach((v, i) => interestOut [i] += v);

    // Add to networth calculation
      sch.balances.forEach((v,i) => {
          plan.netWorth[i] -= v;
          plan.netWorthTaxed[i] -= v;
      });

    plan.loans.push({
      loan:   loan,
      totalCost: loan.monthlyPayment * loan.totalMonths,
      principals: sch.balances,
      ratePayments: sch.interestPaid,
      principalPayments: sch.principalPaid,
    });
  });
  return [principalOut, interestOut];
}

function initializeStockSellOffs(
  stocks: Stock[],
    loans: Loan[],
  totalMonths: number,
): Record<string, number[]> {
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
  return stockSellOffs;
}

function initializeMonthlyPlan(totalMonths: number, stocks: Stock[], loans: Loan[]): MonthlyPlan {
  return {
    loans: [],
    stockInvestments: [],
    propertyInvestments: [],
    stockSellOffs: initializeStockSellOffs(stocks, loans, totalMonths),
    netWorth: new Array<number>(totalMonths).fill(0),
    netWorthTaxed: new Array<number>(totalMonths).fill(0),
    wealth: new Array<number>(totalMonths).fill(0),
    wealthTax: new Array<number>(totalMonths).fill(0),
  };
}

function calculateWealth(plan: MonthlyPlan, currentMonth:number): number {
    let wealthTaxWorth = 0;
    const primaryDiscountMain = 1 - WEALTH_TAX.DISCOUNTS.primaryResidenceMain
    const primaryDiscountSecond = 1 - WEALTH_TAX.DISCOUNTS.primaryResidenceOther
    const secondaryDiscount = 1 - WEALTH_TAX.DISCOUNTS.secondaryResidence;
    const stockDiscount = 1 - WEALTH_TAX.DISCOUNTS.stock;

    // Calculate values for properties
    plan.propertyInvestments.forEach(property => {
        const propertyWorth = property.totalValues[currentMonth]
        if (property.asset.primaryResidence) {
            wealthTaxWorth += Math.min(propertyWorth, 1e7) * primaryDiscountMain;
            wealthTaxWorth += Math.max(0, propertyWorth - 1e7) * primaryDiscountSecond;
        }
        else {
            wealthTaxWorth += propertyWorth * secondaryDiscount;
        }
    });

    // Calculate values for stocks
    plan.stockInvestments.forEach(stock => {
        wealthTaxWorth += stock.totalValues[currentMonth] * stockDiscount;
    });

    // Calculate values for loans
    plan.loans.forEach(loan => {
        wealthTaxWorth -= loan.principals[currentMonth];
    });
    return wealthTaxWorth
}

function calculateWealthTax(wealthTaxWorth: number): number {
    let wealthTax = 0;
    wealthTax += Math.max(0, wealthTaxWorth - WEALTH_TAX.FIRST_THRESHOLD) * WEALTH_TAX.FIRST_RATE;
    wealthTax += Math.max(0, wealthTaxWorth - WEALTH_TAX.SECOND_THRESHOLD) * WEALTH_TAX.SECOND_RATE;
    return wealthTax;
}

function calculateStockValues(plan: MonthlyPlan, valueDict: Record<string, number[]>, investable: number, month: number) : void {
    const stockInvestable = investable / plan.stockInvestments.length;
        plan.stockInvestments.forEach(stockInvestment => {

            const sellOff = plan.stockSellOffs[stockInvestment.asset.id][month] ?? 0;
            const [currentValue, currentInvestedValue] = valueDict[stockInvestment.asset.id] ?? [stockInvestment.asset.currentValue, stockInvestment.asset.initialValue];

            const [newValue, newInvestedValue] = stockInvestment.asset.projectedValueMonth(currentValue, currentInvestedValue, false, stockInvestable, sellOff, !month);
            const [newValueTaxed, ] = stockInvestment.asset.projectedValueMonth(currentValue, currentInvestedValue, true, stockInvestable, sellOff, !month);

            stockInvestment.totalValues[month] = newValue;
            stockInvestment.taxedValues[month] = newValueTaxed;

            // Update networth calculation
            plan.netWorth[month] += newValue;
            plan.netWorthTaxed[month] += newValueTaxed;

            if (month > 0) {
                stockInvestment.investedValues[month-1] += stockInvestable;
            }
            valueDict[stockInvestment.asset.id] = [newValue, newInvestedValue];
        })
}

/**
 * Distributes monthly income between loan payments and stock investments.
 * @param income - The monthly personal income
 * @param loans - Array of Loan objects
 * @param stocks - Array of Stock objects
 * @param properties
 * @param months - Number of months to simulate
 * @param yearlyInflation
 * @param wealthTax
 * @returns Array of MonthlyPlan objects, one per month
 */
export function calculateMonthlyPlan(
  income: number,
  loans: Loan[],
  stocks: Stock[],
  properties: Property[],
  months: number,
  yearlyInflation: number,
  wealthTax: boolean,
): MonthlyPlan {

  const totalMonths = months + 1; // Add +1 to account for month 0

  const plans: MonthlyPlan = initializeMonthlyPlan(totalMonths, stocks, loans);

    calculatePropertyValues(plans, properties, totalMonths);
    const [principalOut, interestOut] = calculateLoanValues(plans, loans, totalMonths);

  const yearlyIncomes = Array.from({ length: totalMonths }, (_, m) =>
    // yearly bump → floor(m / 12)
    income * (1 + yearlyInflation) ** Math.floor(m / 12));

  // Loop for calculating stock investments, investable income and wealth tax
    // Initialize for each stock
    stocks.forEach(stock => {
        const stockValues = new Array<number>(totalMonths).fill(0);
        const stockValuesTaxed = new Array<number>(totalMonths).fill(0);
        const stockInvestedValues = new Array<number>(totalMonths).fill(0);
        plans.stockInvestments.push({
            asset:   stock,
            totalValues: stockValues,
            taxedValues: stockValuesTaxed,
            investedValues: stockInvestedValues
        });
    });
    let stockInvestable = 0;
    const valueDict: Record<string, number[]> = {};
    const INTEREST_TAX_DEDUCTIBLE = 0.22; // 22% tax rate for interest deduction
    for (let m = 0; m < totalMonths; m++) {
        calculateStockValues(plans, valueDict, stockInvestable, m);

        // Calculate wealth and wealth tax
        const wealthTaxWorth = calculateWealth(plans, m);
        plans.wealth[m] = wealthTaxWorth;
        plans.wealthTax[m] = wealthTax ? calculateWealthTax(wealthTaxWorth) : 0;

        // Calculate investable income for next month
        stockInvestable = yearlyIncomes[m]
            - principalOut[m]
            - interestOut[m] * (1- INTEREST_TAX_DEDUCTIBLE)
            - plans.wealthTax[m];
    }

  return plans;
}