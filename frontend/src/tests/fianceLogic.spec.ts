import { describe, it, expect, beforeAll, vi } from 'vitest';
import { calculateMonthlyPlan } from '@/financeLogic';
import { makeLoan, makeStock, makeProperty } from '@/tests/factories';

describe('calculateMonthlyPlan', () => {
  beforeAll(() => {
    // freeze time if your logic uses Date.now() anywhere
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01'));
  });

  it('computes net worth and loan amortization over 24 months', () => {
    const loans = [makeLoan({})];
    const stocks = [makeStock()];
    const properties  = [makeProperty()];

    const plan = calculateMonthlyPlan(
      30_000,           // monthly income
      loans,
      stocks,
      properties,
      24,               // months
      0.025             // inflation
    );

    // basic shape
    expect(plan.netWorth.length).toBe(25); // 0..24
    expect(plan.loans).toHaveLength(1);
    expect(plan.stockInvestments).toHaveLength(1);
    expect(plan.propertyInvestments).toHaveLength(1);

    // amortization should reduce principal
    const l = plan.loans[0];
    expect(l.principals[0]).toBeGreaterThan(l.principals[12]); // principal declines
    expect(l.principalPayments[1]).toBeGreaterThan(0);

    // totals stay consistent with parts (rough sanity)
    const m = 12;
    const totalParts =
      (plan.propertyInvestments[0].totalValues[m] ?? 0) +
      (plan.stockInvestments[0].totalValues[m] ?? 0) -
      (l.principals[m] ?? 0);

    // allow a tiny rounding delta
    expect(Math.abs((plan.netWorth[m] ?? 0) - totalParts)).toBeLessThan(1);
  });
});
