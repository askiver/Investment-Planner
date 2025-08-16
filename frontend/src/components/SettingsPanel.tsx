import './investment-form/investment-form.css';

type SettingsPanelProps = {
  timelineYears: number;
  setTimelineYears: (years: number) => void;
  income: string;
  setIncome: (income: string) => void;
  inflation: string;
  setInflation: (inflation: string) => void;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const toNum = (v: string) => (v.trim() === '' ? NaN : Number(v));

export default function SettingsPanel({
  timelineYears,
  setTimelineYears,
  income,
  setIncome,
  inflation,
  setInflation,
}: SettingsPanelProps) {
  // Enforce 1..50 and integer
  const onTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Math.floor(toNum(e.target.value));
    if (Number.isNaN(n)) return;                     // ignore junk
    setTimelineYears(clamp(n, 1, 50));
  };

  // Enforce income >= 0
  const onIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') return setIncome('');            // let user clear temporarily
    const n = toNum(raw);
    if (Number.isNaN(n)) return;
    setIncome(String(Math.max(0, n)));
  };

  // Enforce 0..100 (change if you want a different max)
  const onInflationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') return setInflation('');
    const n = toNum(raw);
    if (Number.isNaN(n)) return;
    setInflation(String(clamp(n, 0, 100)));
  };

  // Optional: normalize formatting on blur (e.g., remove leading zeros, fix negatives)
  const normalizeIncome = () => {
    const n = toNum(income);
    if (Number.isNaN(n)) return setIncome('0');
    setIncome(String(Math.max(0, n)));
  };
  const normalizeInflation = () => {
    const n = toNum(inflation);
    if (Number.isNaN(n)) return setInflation('0');
    setInflation(String(clamp(n, 0, 100)));
  };

  return (
    <section className="card settings-container">
      <h2>Portfolio Settings</h2>
      {/* FIX: use space-separated classes, not a comma */}
      <div className="settings-form investment-form">
        <div className="form-group">
          <label>Timeline (years):</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            value={timelineYears}
            onChange={onTimelineChange}
            aria-invalid={timelineYears < 1 || timelineYears > 50}
            title="1–50 years"
          />
        </div>

        <div className="form-group">
          <label>Monthly Income:</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={income}
            onChange={onIncomeChange}
            onBlur={normalizeIncome}
            aria-invalid={toNum(income) < 0}
            placeholder="0"
            title="Must be ≥ 0"
          />
        </div>

        <div className="form-group">
          <label>Yearly Inflation (%):</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="any"
            value={inflation}
            onChange={onInflationChange}
            onBlur={normalizeInflation}
            aria-invalid={toNum(inflation) < 0 || toNum(inflation) > 100}
            placeholder="2.5"
            title="0–100%"
          />
        </div>
      </div>
    </section>
  );
}
