// src/components/investment-edit/fields/RateTypeInline.tsx
export default function RateTypeInline({
  checkedEffective,
  onChange,
  name,
}: {
  checkedEffective: boolean;
  onChange: (rateType: 'nominal' | 'effective') => void;
  name: string; // use inv.id for grouping
}) {
  return (
    <div className="rate-inline">
      <label>
        <input
          type="radio"
          name={name}
          value="nominal"
          checked={!checkedEffective}
          onChange={() => onChange('nominal')}
        />{' '}
        Nominal
      </label>
      <label>
        <input
          type="radio"
          name={name}
          value="effective"
          checked={checkedEffective}
          onChange={() => onChange('effective')}
        />{' '}
        Effective
      </label>
    </div>
  );
}
