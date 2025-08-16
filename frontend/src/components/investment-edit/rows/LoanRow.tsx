import type { Loan, Stock } from '@/models';
import type { MonthlyPlan } from '@/financeLogic';
import { loanSpecs as S } from '@/components/forms/specs';
import InlineField from '../fields/InlineField';
import InlineText from '../fields/InlineText';
import InlineNumber from '../fields/InlineNumber';
import RateTypePicker from '@/components/investment-form/fields/RateTypePicker';

export default function LoanRow({
  inv,
  onEdit,
  onRemove,
  stocks,
  plan,
}: {
  inv: Loan;
  onEdit: (field: string, value: string | number | boolean) => void;
  onRemove: () => void;
  stocks: Stock[];
  plan: MonthlyPlan;
}) {
  const planLoan = plan.loans.find((l) => l.loan.name === inv.name);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <b>Loan:</b>
        <button onClick={onRemove} className="remove-btn" title="Remove investment">&times;</button>
      </div>

      <InlineField label={S.name.label}>
        <InlineText spec={S.name} value={inv.name} onChange={(raw) => onEdit('name', raw)} />
      </InlineField>

      <InlineField label={S.principal.label}>
        <InlineNumber spec={S.principal} value={inv.principal} onChange={(raw) => onEdit('principal', raw)} />
      </InlineField>

      <InlineField label={S.startMonths.label}>
        <InlineNumber spec={S.startMonths} value={inv.startMonths} onChange={(raw) => onEdit('startMonths', raw)} />
      </InlineField>

      <InlineField label={S.ratePct.label}>
        <InlineNumber spec={S.ratePct} value={inv.yearlyRate * 100} onChange={(raw) => onEdit('effectiveInterestRate', raw)} />
      </InlineField>

      <InlineField label={S.years.label}>
        <InlineNumber spec={S.years} value={inv.years} onChange={(raw) => onEdit('years', raw)} />
      </InlineField>

      <InlineField label={S.months.label}>
        <InlineNumber spec={S.months} value={inv.months} onChange={(raw) => onEdit('months', raw)} />
      </InlineField>

      <InlineField label={S.monthsDelayed.label}>
        <InlineNumber spec={S.monthsDelayed} value={inv.monthsDelayed} onChange={(raw) => onEdit('monthsDelayed', raw)} />
      </InlineField>

      <div style={{ marginLeft: 16, color: '#bbb', marginTop: 4 }}>
        <div>
          Monthly Payment:{' '}
          {inv.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          {planLoan && (
            <span style={{ marginLeft: 16 }}>
              Total Cost: {planLoan.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
        <InlineField label={S.downPayment.label}>
          <InlineNumber spec={S.downPayment} value={inv.downPayment} onChange={(raw) => onEdit('downPayment', raw)} />
        </InlineField>

        <span style={{ marginLeft: 16, marginRight: 8 }}>Source:</span>
        <select
          value={inv.stockSourceId || ''}
          onChange={(e) => onEdit('stockSourceId', e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="">None (External funds)</option>
          {stocks.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {inv.downPayment > 0 && inv.stockSourceId && (
          <span>
            Amount: {inv.downPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      <InlineField label="Rate type">
        <RateTypePicker
          idPrefix={`loan-${inv.id}`}
          value={inv.effectiveRate ? 'effective' : 'nominal'}
          onChange={(rt) => onEdit('rateType', rt)}
        />
      </InlineField>

      <input
        type="color"
        name="color"
        value={inv.color}
        onChange={(e) => onEdit('color', e.target.value)}
        style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }}
        title="Edit color"
      />
    </>
  );
}
