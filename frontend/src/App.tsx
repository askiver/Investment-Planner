import { useState } from 'react'
import './App.css'
import { Property, Stock, Loan } from './models'
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateMonthlyPlan } from './financeLogic';
import type { MonthlyPlan } from './financeLogic';
import logoImage from './assets/logo.png';


type InvestmentType = 'Property' | 'Stock' | 'Loan';
type Investment = Property | Stock | Loan;

type FormState = {
  name: string;
  initialValue: string;
  expectedReturn: string;
  taxRate: string;
  principal: string;
  effectiveInterestRate: string;
  years: string;
  months: string;
  monthlyInvestment: string;
  monthsDelayed: string;
  color: string;
  rateType: 'effective' | 'nominal';
};


const norwegianDefaults: Record<InvestmentType, Omit<FormState, 'months'>> = {
  Property: {
    name: 'Standard Apartment',
    initialValue: '4000000',
    expectedReturn: '3', // percent
    taxRate: '22',      // percent
    principal: '',
    effectiveInterestRate: '',
    years: '',
    monthlyInvestment: '',
    monthsDelayed: '',
    color: '#1f77b4',
    rateType: 'effective',
  },
  Stock: {
    name: 'Index Fund',
    initialValue: '100000',
    expectedReturn: '7', // percent
    taxRate: '22',      // percent
    principal: '',
    effectiveInterestRate: '',
    years: '',
    monthlyInvestment: '',
    monthsDelayed: '',
    color: '#2ca02c',
    rateType: 'effective',
  },
  Loan: {
    name: 'Mortgage',
    initialValue: '',
    expectedReturn: '',
    taxRate: '',
    principal: '3000000',
    effectiveInterestRate: '5', // percent
    years: '25',
    monthlyInvestment: '',
    monthsDelayed: '0',
    color: '#d62728',
    rateType: 'effective',
  },
};

function App() {
  const [investmentType, setInvestmentType] = useState<InvestmentType>('Property');
  const [investments, setInvestments] = useState<Array<Property | Stock | Loan>>([]);
  const [timelineMonths, setTimelineMonths] = useState(12);
  const [income, setIncome] = useState('10000');
  const [inflation, setInflation] = useState('2.5');

  // Form state
  const [form, setForm] = useState<FormState>({
    ...norwegianDefaults[investmentType],
    months: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as InvestmentType;
    setInvestmentType(newType);
    setForm({
      ...norwegianDefaults[newType],
      months: '',
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newInvestment: Investment | null = null;
    const id = crypto.randomUUID();
    // Assign a random color if none selected
    const color = form.color || expandedColors[Math.floor(Math.random() * expandedColors.length)];
    const isEffective = form.rateType === 'effective';
    if (investmentType === 'Property') {
      newInvestment = new Property(
        id,
        form.name,
        parseFloat(form.initialValue),
        parseFloat(form.expectedReturn) / 100, // convert percent to decimal
        isEffective,
        parseFloat(form.taxRate) / 100,        // convert percent to decimal
        color
      );
    } else if (investmentType === 'Stock') {
      newInvestment = new Stock(
        id,
        form.name,
        parseFloat(form.initialValue),
        parseFloat(form.expectedReturn) / 100, // convert percent to decimal
        isEffective,
        parseFloat(form.taxRate) / 100,        // convert percent to decimal
        color
      );
    } else if (investmentType === 'Loan') {
      newInvestment = new Loan(
        id,
        form.name,
        parseFloat(form.principal),
        parseFloat(form.effectiveInterestRate) / 100, // convert percent to decimal
        isEffective,
        parseInt(form.years),
        parseInt(form.months || '0'), // Include months in the calculation
        parseInt(form.monthsDelayed || '0'),
        color
      );
    }
    if (newInvestment) {
      setInvestments(prev => [...prev, newInvestment]);
      setForm({
        ...norwegianDefaults[investmentType],
        months: '',
      });
    }
  };

  // Split investments into types
  const loans = investments.filter(inv => inv instanceof Loan) as Loan[];
  const stocks = investments.filter(inv => inv instanceof Stock) as Stock[];
  const properties = investments.filter(inv => inv instanceof Property) as Property[];

  // Calculate monthly plan using financeLogic
  const plan: MonthlyPlan = calculateMonthlyPlan(
    parseFloat(income) || 0,
    loans,
    stocks,
    properties,
    timelineMonths,
    parseFloat(inflation) / 100 || 0
  );

  // Prepare data for stacked area chart (pre-tax and after-tax)
  const getChartData = (useTaxed: boolean): {
    data: Record<string, number>[];
    assetKeys: string[];
    loanKeys: string[];
  } => {
    const data: Record<string, number>[] = [];
    const maxMonths = timelineMonths + 1;
    // Track which loans are still active for each month
    const activeLoanKeys: Set<string> = new Set(plan.loans.map(l => l.loanName));
    for (let m = 0; m < maxMonths; m++) {
      const entry: Record<string, number> = { month: m };
      let runningTotal = 0;
      let loanTotal = 0;
      // Stocks
      plan.stockInvestments.forEach(stockPlan => {
        const val = useTaxed ? stockPlan.taxedValues[m] ?? 0 : stockPlan.totalValues[m] ?? 0;
        entry[stockPlan.assetName] = val;
        runningTotal += val;
      });
      // Properties
      plan.propertyInvestments.forEach(propertyPlan => {
        const val = useTaxed ? propertyPlan.taxedValues[m] ?? 0 : propertyPlan.totalValues[m] ?? 0;
        entry[propertyPlan.assetName] = val;
        runningTotal += val;
      });
      // Loans (as negative)
      plan.loans.forEach(loanPlan => {
        const principal = loanPlan.principals[m] ?? 0;
        if (principal > 0) {
          entry[loanPlan.loanName] = -principal; // Negative for stacking below x-axis
          loanTotal += principal;
        } else {
          // Remove loan from active set if paid off
          activeLoanKeys.delete(loanPlan.loanName);
        }
      });
      entry['Total'] = runningTotal - loanTotal;
      data.push(entry);
    }
    // Only include loan keys that are active at any point in the timeline
    const loanKeys = plan.loans.map(l => l.loanName).filter(name => data.some(entry => entry[name] < 0));
    return {
      data,
      assetKeys: plan.stockInvestments.map(s => s.assetName).concat(plan.propertyInvestments.map(p => p.assetName)),
      loanKeys
    };
  };
  const { data: chartData, assetKeys, loanKeys } = getChartData(false);
  const { data: chartDataWithTax, assetKeys: assetKeysWithTax, loanKeys: loanKeysWithTax } = getChartData(true);

  // Custom tooltip to show total
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string; payload: { Total?: number } }[]; label?: string | number }) => {
    if (active && label !== undefined && payload) {
      const hoveredData = payload && payload.length && payload[0].payload ? payload[0].payload : {};
      const total = typeof hoveredData.Total === 'number' ? hoveredData.Total : null;
      return (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Month: {label}</div>
          {payload.map((p) => (
            <div key={p.name} style={{ color: p.color }}>
              {p.name}: {p.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          ))}
          {total !== null && (
            <div style={{ marginTop: 4, color: '#000' }}>
              <b>Total:</b> {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Handler for inline editing of investments
  const handleInvestmentEdit = (id: string, field: string, value: string | number | boolean) => {
    setInvestments(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      // For each type, update the relevant fields
      if (inv instanceof Property) {
        if (field === 'name') return new Property(id, value as string, inv.initialValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
        if (field === 'initialValue') return new Property(id, inv.name, parseFloat(value as string), inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
        if (field === 'expectedReturn') return new Property(id, inv.name, inv.initialValue, parseFloat(value as string) / 100, inv.effectiveRate, inv.taxRate, inv.color);
        if (field === 'taxRate') return new Property(id, inv.name, inv.initialValue, inv.yearlyRate, inv.effectiveRate, parseFloat(value as string) / 100, inv.color);
        if (field === 'color') return new Property(id, inv.name, inv.initialValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, value as string);
        if (field === 'rateType') return new Property(id, inv.name, inv.initialValue, inv.yearlyRate, value === 'effective', inv.taxRate, inv.color);
        return inv;
      }
      if (inv instanceof Stock) {
        if (field === 'name') return new Stock(id, value as string, inv.initialValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
        if (field === 'initialValue') return new Stock(id, inv.name, parseFloat(value as string), inv.yearlyRate, inv.effectiveRate, inv.taxRate, inv.color);
        if (field === 'expectedReturn') return new Stock(id, inv.name, inv.initialValue, parseFloat(value as string) / 100, inv.effectiveRate, inv.taxRate, inv.color);
        if (field === 'taxRate') return new Stock(id, inv.name, inv.initialValue, inv.yearlyRate, inv.effectiveRate, parseFloat(value as string) / 100, inv.color);
        if (field === 'color') return new Stock(id, inv.name, inv.initialValue, inv.yearlyRate, inv.effectiveRate, inv.taxRate, value as string);
        if (field === 'rateType') return new Stock(id, inv.name, inv.initialValue, inv.yearlyRate, value === 'effective', inv.taxRate, inv.color);
        return inv;
      }
      if (inv instanceof Loan) {
        if (field === 'name') return new Loan(id, value as string, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, inv.color);
        if (field === 'principal') return new Loan(id, inv.name, parseFloat(value as string), inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, inv.color);
        if (field === 'effectiveInterestRate') return new Loan(id, inv.name, inv.principal, parseFloat(value as string) / 100, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, inv.color);
        if (field === 'years') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, parseInt(value as string), inv.months, inv.monthsDelayed, inv.color);
        if (field === 'months') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, parseInt(value as string), inv.monthsDelayed, inv.color);
        if (field === 'monthsDelayed') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, parseInt(value as string), inv.color);
        if (field === 'color') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.months, inv.monthsDelayed, value as string);
        if (field === 'rateType') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, value === 'effective', inv.years, inv.months, inv.monthsDelayed, inv.color);
        return inv;
      }
      return inv;
    }));
  };

  // Expanded color palette for random assignment
  const expandedColors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173', '#5254a3', '#9c9ede', '#cedb9c', '#e7ba52', '#ad494a', '#a55194',
    '#6b6ecf', '#b5cf6b', '#bd9e39', '#bd9e39', '#ce6dbd', '#de9ed6', '#393b79', '#637939', '#8c6d31', '#843c39',
  ];

  return (
    <div className="app-background">
      <header className="app-header">
        <img src={logoImage} alt="Investment Planner Logo" className="app-logo" style={{ maxHeight: '50px' }} />
        <h1>Investment Planner</h1>
        <p className="app-subtitle">Plan, visualize, and compare your investments and loans</p>
      </header>
      <main className="main-content">
        <section className="card form-container">
          <h2>Add Investment</h2>
          <form onSubmit={handleFormSubmit} className="investment-form" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label>Type:</label>
              <select name="type" value={investmentType} onChange={handleTypeChange}>
                <option value="Property">Property</option>
                <option value="Stock">Stock</option>
                <option value="Loan">Loan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} required />
            </div>
            {investmentType === 'Property' && (
              <>
                <div className="form-group">
                  <label>Initial Value:</label>
                  <input name="initialValue" placeholder="Initial Value" type="number" value={form.initialValue} onChange={handleFormChange} step="any" required />
                </div>
                <div className="form-group">
                  <label>Tax Rate (%):</label>
                  <input name="taxRate" placeholder="Tax Rate (%)" type="number" value={form.taxRate} onChange={handleFormChange} step="any" min={0} max={100} required />
                </div>
                <div className="form-group">
                  <label>Yearly Rate (%):</label>
                  <input name="expectedReturn" placeholder="Yearly Rate (%)" type="number" value={form.expectedReturn} onChange={handleFormChange} step="any" min={0} max={100} required />
                </div>
                <div className="form-group">
                  <label>Rate type:</label>
                  <div className="rate-type-options">
                    <label>
                      <input
                        type="radio"
                        name="rateType"
                        value="nominal"
                        checked={form.rateType === 'nominal'}
                        onChange={handleFormChange}
                      /> Nominal
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="rateType"
                        value="effective"
                        checked={form.rateType === 'effective'}
                        onChange={handleFormChange}
                      /> Effective
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Color:</label>
                  <input name="color" type="color" value={form.color || '#8884d8'} onChange={handleFormChange} style={{ width: 40, height: 30 }} title="Pick a color" />
                </div>
              </>
            )}
            {investmentType === 'Stock' && (
              <>
                <div className="form-group">
                  <label>Initial Value:</label>
                  <input name="initialValue" placeholder="Initial Value" type="number" value={form.initialValue} onChange={handleFormChange} step="any" required />
                </div>
                <div className="form-group">
                  <label>Tax Rate (%):</label>
                  <input name="taxRate" placeholder="Tax Rate (%)" type="number" value={form.taxRate} onChange={handleFormChange} step="any" min={0} max={100} required />
                </div>
                <div className="form-group">
                  <label>Yearly Rate (%):</label>
                  <input name="expectedReturn" placeholder="Yearly Rate (%)" type="number" value={form.expectedReturn} onChange={handleFormChange} step="any" min={0} max={100} required />
                </div>
                <div className="form-group">
                  <label>Rate type:</label>
                  <div className="rate-type-options">
                    <label>
                      <input
                        type="radio"
                        name="rateType"
                        value="nominal"
                        checked={form.rateType === 'nominal'}
                        onChange={handleFormChange}
                      /> Nominal
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="rateType"
                        value="effective"
                        checked={form.rateType === 'effective'}
                        onChange={handleFormChange}
                      /> Effective
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Color:</label>
                  <input name="color" type="color" value={form.color || '#82ca9d'} onChange={handleFormChange} style={{ width: 40, height: 30 }} title="Pick a color" />
                </div>
              </>
            )}
            {investmentType === 'Loan' && (
              <>
                <div className="form-group">
                  <label>Principal:</label>
                  <input name="principal" placeholder="Principal" type="number" value={form.principal} onChange={handleFormChange} step="any" required />
                </div>
                <div className="form-group">
                  <label>Years:</label>
                  <input name="years" placeholder="Years" type="number" value={form.years} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Months:</label>
                  <input name="months" placeholder="Months" type="number" value={form.months} onChange={handleFormChange} min={0} max={11} />
                </div>
                <div className="form-group">
                  <label>Delayed Months:</label>
                  <input name="monthsDelayed" placeholder="Delayed Months" type="number" value={form.monthsDelayed} onChange={handleFormChange} min={0} />
                </div>
                <div className="form-group">
                  <label>Interest Rate (%):</label>
                  <input name="effectiveInterestRate" placeholder="Interest Rate (%)" type="number" value={form.effectiveInterestRate} onChange={handleFormChange} step="any" min={0} max={100} required />
                </div>
                <div className="form-group">
                  <label>Rate type:</label>
                  <div className="rate-type-options">
                    <label>
                      <input
                        type="radio"
                        name="rateType"
                        value="nominal"
                        checked={form.rateType === 'nominal'}
                        onChange={handleFormChange}
                      /> Nominal
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="rateType"
                        value="effective"
                        checked={form.rateType === 'effective'}
                        onChange={handleFormChange}
                      /> Effective
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Color:</label>
                  <input name="color" type="color" value={form.color || '#ff7300'} onChange={handleFormChange} style={{ width: 40, height: 30 }} title="Pick a color" />
                </div>
              </>
            )}
            <button type="submit" className="submit-button">Add</button>
          </form>
        </section>
        <section className="card settings-container">
          <h2>Portfolio Settings</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>Timeline (months):</label>
              <input
                type="number"
                min={1}
                max={600}
                value={timelineMonths}
                onChange={e => setTimelineMonths(Number(e.target.value))}
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
        <section className="card chart-section">
          <h2>Portfolio Value Over Time (No Tax)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month"
                     tickFormatter={value => (value / 12).toFixed(0)}
                     interval={11}
                     label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
               />
              <YAxis width={90} tickFormatter={value => value.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              <Tooltip content={CustomTooltip} />
              <Legend />
              {assetKeys.map((key, idx) => {
                // Find the investment by name to get its color
                const inv = investments.find(i => i.name === key);
                const color = inv && inv.color ? inv.color : expandedColors[idx % expandedColors.length];
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={color}
                    fill={color}
                    isAnimationActive={false}
                  />
                );
              })}
              {loanKeys.map((key, idx) => {
                // Find the investment by name to get its color
                const inv = investments.find(i => i.name === key);
                const color = inv && inv.color ? inv.color : expandedColors[(idx + 10) % expandedColors.length];
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="loans"
                    stroke={color}
                    fill={color}
                    isAnimationActive={false}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
          <h2>Portfolio Value Over Time (With Tax)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartDataWithTax} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month"
                     tickFormatter={value => (value / 12).toFixed(0)}
                     interval={11}
                     label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
               />
              <YAxis width={90} tickFormatter={value => value.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              <Tooltip content={CustomTooltip} />
              <Legend />
              {assetKeysWithTax.map((key, idx) => {
                // Find the investment by name to get its color
                const inv = investments.find(i => i.name === key);
                const color = inv && inv.color ? inv.color : expandedColors[idx % expandedColors.length];
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={color}
                    fill={color}
                    isAnimationActive={false}
                  />
                );
              })}
              {loanKeysWithTax.map((key, idx) => {
                // Find the investment by name to get its color
                const inv = investments.find(i => i.name === key);
                const color = inv && inv.color ? inv.color : expandedColors[(idx + 10) % expandedColors.length];
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="loans"
                    stroke={color}
                    fill={color}
                    isAnimationActive={false}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </section>
        <section className="card investments-section">
          <h2>Investments</h2>
          <ul>
            {investments.map((inv) => (
              <li key={inv.id} style={{ marginBottom: 12 }}>
                {inv instanceof Property && (
                  <>
                    <b>Property:</b>
                    <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                    <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.initialValue)} onChange={e => handleInvestmentEdit(inv.id, 'initialValue', e.target.value)} />
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.taxRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
                    <span style={{ marginLeft: 8 }}>
                      <label style={{ marginRight: 4 }}>Rate type:</label>
                      <label>
                        <input
                          type="radio"
                          name="rateType"
                          value="nominal"
                          checked={!inv.effectiveRate}
                          onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                        /> Nominal
                      </label>
                      <label style={{ marginLeft: 8 }}>
                        <input
                          type="radio"
                          name="rateType"
                          value="effective"
                          checked={inv.effectiveRate}
                          onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'effective')}
                        /> Effective
                      </label>
                    </span>
                    <input
                      name="color"
                      type="color"
                      value={inv.color}
                      onChange={e => handleInvestmentEdit(inv.id, 'color', e.target.value)}
                      style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }}
                      title="Edit color"
                    />
                  </>
                )}
                {inv instanceof Stock && (
                  <>
                    <b>Stock:</b>
                    <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                    <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.initialValue)} onChange={e => handleInvestmentEdit(inv.id, 'initialValue', e.target.value)} />
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.taxRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
                    <span style={{ marginLeft: 8 }}>
                      <label style={{ marginRight: 4 }}>Rate type:</label>
                      <label>
                        <input
                          type="radio"
                          name="rateType"
                          value="nominal"
                          checked={!inv.effectiveRate}
                          onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                        /> Nominal
                      </label>
                      <label style={{ marginLeft: 8 }}>
                        <input
                          type="radio"
                          name="rateType"
                          value="effective"
                          checked={inv.effectiveRate}
                          onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'effective')}
                        /> Effective
                      </label>
                    </span>
                    <input
                      name="color"
                      type="color"
                      value={inv.color}
                      onChange={e => handleInvestmentEdit(inv.id, 'color', e.target.value)}
                      style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }}
                      title="Edit color"
                    />
                  </>
                )}
                {inv instanceof Loan && (
                  <>
                    <b>Loan:</b>
                    <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                    <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.principal)} onChange={e => handleInvestmentEdit(inv.id, 'principal', e.target.value)} />
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'effectiveInterestRate', e.target.value)} />%
                    <span style={{ marginLeft: 8 }}>
                      <label style={{ marginRight: 4 }}>Rate type:</label>
                      <label>
                        <input
                          type="radio"
                          name="rateType"
                          value="nominal"
                          checked={!inv.effectiveRate}
                          onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                        /> Nominal
                      </label>
                      <label style={{ marginLeft: 8 }}>
                        <input
                          type="radio"
                          name="rateType"
                          value="effective"
                          checked={inv.effectiveRate}
                          onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'effective')}
                        /> Effective
                      </label>
                    </span>
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.years)} onChange={e => handleInvestmentEdit(inv.id, 'years', e.target.value)} /> (Years)
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.months)} onChange={e => handleInvestmentEdit(inv.id, 'months', e.target.value)} /> (Months)
                    <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.monthsDelayed)} onChange={e => handleInvestmentEdit(inv.id, 'monthsDelayed', e.target.value)} /> (Delayed Months)
                    <div style={{ marginLeft: 16, color: '#555' }}>
                      Monthly Payment: ${
                        inv.monthlyPayment.toLocaleString(
                          undefined, { maximumFractionDigits: 2 })
                      }
                      {/* Show total loan cost if available in plan */}
                      {(() => {
                        const planLoan = plan.loans.find(l => l.loanName === inv.name);
                        return planLoan ? (
                          <span style={{ marginLeft: 16 }}>
                            Total Cost: {planLoan.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <input
                      name="color"
                      type="color"
                      value={inv.color}
                      onChange={e => handleInvestmentEdit(inv.id, 'color', e.target.value)}
                      style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }}
                      title="Edit color"
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="app-footer">
        <p>Investment Planner &copy; 2025. Made with React and Recharts.</p>
      </footer>
    </div>
  )
}

export default App
