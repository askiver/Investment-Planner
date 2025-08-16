import { useState } from 'react';
import type { Loan, Stock } from '@/models';
import { buildLoan } from '../builders';
import { loanDefaults } from '../defaults';
import { loanSpecs as S } from '@/components/forms/specs';
import { numberInputProps, textInputProps } from '@/components/forms/ui';
import RateTypePicker from '../fields/RateTypePicker';
import ColorPicker from '../fields/ColorPicker';

export default function LoanForm({
  onSubmit,
  stocks,
}: { onSubmit: (l: Loan) => void; stocks: Stock[] }) {
  const [v, setV] = useState(loanDefaults);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setV((s: any) => ({ ...s, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(buildLoan(v));
      }}
      className="investment-form"
    >
      <div className="form-group">
        <label>{S.name.label}</label>
        <input {...textInputProps(S.name)} name="name" value={v.name} onChange={change} required />
      </div>

      <div className="form-group">
        <label>{S.principal.label}</label>
        <input
          {...numberInputProps(S.principal)}
          name="principal"
          type="number"
          value={v.principal}
          onChange={change}
          required
        />
      </div>

      <div className="form-group">
        <label>{S.startMonths.label}</label>
        <input
          {...numberInputProps(S.startMonths)}
          name="startMonths"
          type="number"
          value={v.startMonths}
          onChange={change}
        />
      </div>

      <div className="form-group">
        <label>{S.years.label}</label>
        <input
          {...numberInputProps(S.years)}
          name="years"
          type="number"
          value={v.years}
          onChange={change}
          required
        />
      </div>

      <div className="form-group">
        <label>{S.months.label}</label>
        <input
          {...numberInputProps(S.months)}
          name="months"
          type="number"
          value={v.months}
          onChange={change}
        />
      </div>

      <div className="form-group">
        <label>{S.monthsDelayed.label}</label>
        <input
          {...numberInputProps(S.monthsDelayed)}
          name="monthsDelayed"
          type="number"
          value={v.monthsDelayed}
          onChange={change}
        />
      </div>

      <div className="form-group">
        <label>{S.ratePct.label}</label>
        <input
          {...numberInputProps(S.ratePct)}
          name="effectiveInterestRate"
          type="number"
          value={v.effectiveInterestRate}
          onChange={change}
          required
        />
      </div>

      {/* Optional extras specific to non-student loans */}
      <div className="form-group">
        <label>{S.downPayment.label}</label>
        <input
          {...numberInputProps(S.downPayment)}
          name="downPayment"
          type="number"
          value={v.downPayment}
          onChange={change}
        />
      </div>

      <div className="form-group">
        <label>Source of Down Payment:</label>
        <select name="stockSourceId" value={v.stockSourceId} onChange={change}>
          <option value="">None (External funds)</option>
          {stocks.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <RateTypePicker
        idPrefix="loan"
        value={v.rateType}
        onChange={(rateType) => setV((s: any) => ({ ...s, rateType }))}
      />

      <ColorPicker
        value={v.color}
        defaultColor="#ff7300"
        onChange={(color) => setV((s: any) => ({ ...s, color }))}
      />

      <button type="submit" className="submit-button">Add</button>
    </form>
  );
}
