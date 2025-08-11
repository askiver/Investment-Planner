import { describe, it, expect } from 'vitest';
import {makeLoan, makeProperty, makeStock} from '@/tests/factories';

describe('Check loan plan calculations', () => {
    it("Normal rate loan amortization", () => {
        const normalRateLoan = makeLoan({effectiveRate:false});
        const schedule = normalRateLoan.getSchedule(2400);

        expect(schedule.balances[10]).toBeCloseTo(2_948_667.85, 2);
        expect(schedule.interestPaid[10]).toBeCloseTo(12_286.12, 2);
        expect(schedule.principalPaid[10]).toBeCloseTo(5_251.59, 2);

        expect(schedule.balances[288]).toBeCloseTo(204_861.78, 2);
        expect(schedule.interestPaid[288]).toBeCloseTo(853.59, 2);
        expect(schedule.principalPaid[288]).toBeCloseTo(16_684.11, 2);
    })

    it("Effective rate loan amortization", () => {
        const effectiveRateLoan = makeLoan({effectiveRate:true});
        const schedule = effectiveRateLoan.getSchedule(2400);

        expect(schedule.balances[10]).toBeCloseTo(2_947_832.98, 2);
        expect(schedule.interestPaid[10]).toBeCloseTo(12_009.84, 2);
        expect(schedule.principalPaid[10]).toBeCloseTo(5_334.31, 2);

        expect(schedule.balances[288]).toBeCloseTo(202_721.31, 2);
        expect(schedule.interestPaid[288]).toBeCloseTo(825.91, 2);
        expect(schedule.principalPaid[288]).toBeCloseTo(16_518.23, 2);
    })

    it("Delayed loan amortization", () => {
        const delayedLoan = makeLoan({monthsDelayed:12});
        const schedule = delayedLoan.getSchedule(2400);

        expect(delayedLoan.monthlyPayment).toBeCloseTo(18_211.35, 2);

        const totalInterest = schedule.interestPaid.reduce((sum, n) => sum + n, 0);
        const totalPrincipal = schedule.principalPaid.reduce((sum, n) => sum + n, 0);

        expect(totalInterest + totalPrincipal).toBeCloseTo(5_463_405.88, 1);
    })
})

describe('Check stock plan calculations', () => {
    const totalMonths = 121;
    const static_stock = makeStock()
    const monthly_investments = new Array<number>(totalMonths).fill(0);
    const sellOffs = new Array<number>(totalMonths).fill(0);
    const returns = static_stock.projectedValue(totalMonths, false, monthly_investments, sellOffs);

    it("Stock investment without monthly contributions", () => {

        expect(returns[12]).toBeCloseTo(107_000.00, 2);
        expect(returns[109]).toBeCloseTo(184_885.41, 2);

    })
    it("Stock investment with monthly contributions", () => {
        const monthly_investments = new Array<number>(totalMonths).fill(1000);
        const returns = static_stock.projectedValue(totalMonths, false, monthly_investments, sellOffs);

        expect(returns[12]).toBeCloseTo(119_380.30, 2);
        expect(returns[109]).toBeCloseTo(335_014.93, 2);
    })
})

describe('Check property plan calculations', () => {

    it("Property investment", () => {
      const totalMonths = 121;
      const property = makeProperty()
      const returns = property.projectedValue(totalMonths, false);

        expect(returns[12]).toBeCloseTo(4_120_000.00, 2);
        expect(returns[109]).toBeCloseTo(5_231_964.43, 2);
  })
})