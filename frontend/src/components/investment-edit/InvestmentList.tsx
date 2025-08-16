// src/components/investment-edit/InvestmentList.tsx
import { Property, Stock, Loan, StudentLoan } from '@/models/models';
import type { MonthlyPlan } from '@/financeLogic';
import PropertyRow from './rows/PropertyRow';
import StockRow from './rows/StockRow';
import LoanRow from './rows/LoanRow';
import StudentLoanRow from './rows/StudentLoanRow';

type Props = {
  investments: Array<Property | Stock | Loan | StudentLoan>;
  handleInvestmentRemove: (id: string) => void;
  handleInvestmentEdit: (id: string, field: string, value: string | number | boolean) => void;
  plan: MonthlyPlan;
  stocks: Stock[];
};

export default function InvestmentList({
  investments,
  handleInvestmentRemove,
  handleInvestmentEdit,
  plan,
  stocks,
}: Props) {
  return (
    <section className="card investments-section">
      <h2>Investments</h2>
      <ul className="investment-list">
        {investments.map(inv => (
  <li key={inv.id}>
    {inv instanceof Property && (
      <PropertyRow
        inv={inv}
        onEdit={(field, val) => handleInvestmentEdit(inv.id, field, val)}
        onRemove={() => handleInvestmentRemove(inv.id)}
      />
    )}
    {inv instanceof Stock && (
      <StockRow
        inv={inv}
        onEdit={(field, val) => handleInvestmentEdit(inv.id, field, val)}
        onRemove={() => handleInvestmentRemove(inv.id)}
      />
    )}
    {inv instanceof Loan && (
      <LoanRow
        inv={inv}
        onEdit={(field, val) => handleInvestmentEdit(inv.id, field, val)}
        onRemove={() => handleInvestmentRemove(inv.id)}
        stocks={stocks}
        plan={plan}
      />
    )}
    {inv instanceof StudentLoan && (
        <StudentLoanRow
        inv={inv}
        onEdit={(field, val) => handleInvestmentEdit(inv.id, field, val)}
        onRemove={() => handleInvestmentRemove(inv.id)}
        plan={plan}
  />
)}
  </li>
))}
      </ul>
    </section>
  );
}
