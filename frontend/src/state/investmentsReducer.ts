// src/state/investmentsReducer.ts
import { Property, Stock, Loan, StudentLoan } from '@/models';
import { updateInvestment } from '@/utils/updateInvestment';

export type InvestmentAny = Property | Stock | Loan | StudentLoan;

export type InvestmentAction =
  | { type: 'add'; payload: InvestmentAny }
  | { type: 'remove'; id: string }
  | { type: 'update'; id: string; field: string; value: string | number | boolean };

export function investmentsReducer(state: InvestmentAny[], action: InvestmentAction): InvestmentAny[] {
  switch (action.type) {
    case 'add':
      return [...state, action.payload];

    case 'update':
      return state.map(inv =>
        inv.id === action.id ? updateInvestment(inv, action.field, action.value) : inv
      );

    case 'remove': {
      // If removing a stock, clear stockSourceId from loans that reference it
      const removed = state.find(x => x.id === action.id);
      const cleared = removed instanceof Stock
        ? state.map(inv => {
            if (inv instanceof Loan && inv.stockSourceId === removed.id) {
              return new Loan(
                inv.id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate,
                inv.years, inv.months, inv.monthsDelayed, inv.startMonths, inv.color,
                inv.downPayment, null
              );
            }
            return inv;
          })
        : state;

      return cleared.filter(inv => inv.id !== action.id);
    }

    default:
      return state;
  }
}
