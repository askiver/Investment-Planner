type SettingsPanelProps = {
  timelineYears: number;
  setTimelineYears: (years: number) => void;
  income: string;
  setIncome: (income: string) => void;
  inflation: string;
  setInflation: (inflation: string) => void;
};

const SettingsPanel = ({
  timelineYears,
  setTimelineYears,
  income,
  setIncome,
  inflation,
  setInflation
}: SettingsPanelProps) => {
  return (
    <section className="card settings-container">
      <h2>Portfolio Settings</h2>
      <div className="settings-form">
        <div className="form-group">
          <label>Timeline (years):</label>
          <input
            type="number"
            min={1}
            max={50}
            value={timelineYears}
            onChange={e => setTimelineYears(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Monthly Income:</label>
          <input
            type="number"
            value={income}
            onChange={e => setIncome(e.target.value)}
            min={0}
          />
        </div>
        <div className="form-group">
          <label>Yearly Inflation (%):</label>
          <input
            type="number"
            step="any"
            min="0"
            value={inflation}
            onChange={e => setInflation(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};

export default SettingsPanel;
