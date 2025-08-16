import { useState } from 'react';
import type { StudentLoan } from '@/models';
import { buildStudentLoan } from '../builders';
import { studentLoanDefaults } from '../defaults';
import { studentLoanSpecs as S } from '@/components/forms/specs';
import { numberInputProps, textInputProps } from '@/components/forms/ui';
import RateTypePicker from '../fields/RateTypePicker';
import ColorPicker from '../fields/ColorPicker';

export default function StudentLoanForm({ onSubmit }: { onSubmit: (l: StudentLoan) => void }) {
  const [v, setV] = useState(studentLoanDefaults);

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setV((s: any) => ({ ...s, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(buildStudentLoan(v));
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

      <RateTypePicker
        idPrefix="student-loan"
        value={v.rateType}
        onChange={(rateType) => setV((s: any) => ({ ...s, rateType }))}
      />

      <ColorPicker
        value={v.color}
        defaultColor="#9467bd"
        onChange={(color) => setV((s: any) => ({ ...s, color }))}
      />

      <button type="submit" className="submit-button">Add</button>
    </form>
  );
}
