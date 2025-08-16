// src/components/investment-form/fields/RateTypePicker.tsx
type Props = {
  name?: string;  // input name (optional)
  value: 'effective' | 'nominal';
  onChange: (value: 'effective' | 'nominal') => void;
  idPrefix?: string;
};

export default function RateTypePicker({ value, onChange, idPrefix = 'rate' }: Props) {
  return (
    <div className="form-group">
      <label>Rate type:</label>
      <div className="rate-type-options">
        <label>
          <input
            type="radio"
            name={nameOr(idPrefix)}
            value="nominal"
            checked={value === 'nominal'}
            onChange={() => onChange('nominal')}
            id={`${idPrefix}-nominal`}
          /> Nominal
        </label>
        <label>
          <input
            type="radio"
            name={nameOr(idPrefix)}
            value="effective"
            checked={value === 'effective'}
            onChange={() => onChange('effective')}
            id={`${idPrefix}-effective`}
          /> Effective
        </label>
      </div>
    </div>
  );
  function nameOr(prefix: string) { return `rateType-${prefix}`; }
}
