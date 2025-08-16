import type { Loan, Stock } from '@/models/models';
import InlineAuto from '@/components/forms/auto/InlineAuto';
import { loanSchema } from '@/components/forms/schemas';
import type { MonthlyPlan } from '@/financeLogic';

export default function LoanRow({
  inv, onEdit, onRemove, stocks, plan,
}: {
  inv: Loan;
  onEdit: (field: string, value: string | number | boolean) => void;
  onRemove: () => void;
  stocks: Stock[];
  plan: MonthlyPlan;
}) {
  const planLoan = plan.loans.find(l => l.loan.name === inv.name);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <b>Loan:</b>
        <button onClick={onRemove} className="remove-btn" title="Remove investment">&times;</button>
      </div>

      <InlineAuto schema={loanSchema} model={inv} onEdit={onEdit} context={{ stocks }} />

      <div style={{ marginLeft: 16, color: '#555', marginTop: 6 }}>
        <div>
          Monthly Payment: {inv.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          {planLoan && (
            <span style={{ marginLeft: 16 }}>
              Total Cost: {planLoan.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
