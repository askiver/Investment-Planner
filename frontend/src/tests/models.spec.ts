import { describe, it, expect, vi } from 'vitest';
import { makeLoan, makeStock, makeProperty } from '@/tests/factories';

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