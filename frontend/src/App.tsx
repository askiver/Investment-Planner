import { useState } from 'react'
import './App.css'
import { Property, Stock, Loan } from './models'
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateMonthlyPlan } from './financeLogic';
import type { MonthlyPlan } from './financeLogic';


type InvestmentType = 'Property' | 'Stock' | 'Loan';
type Investment = Property | Stock | Loan;

// Norwegian defaults for each investment type
type RateType = 'nominal' | 'effective';

const norwegianDefaults = {
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
  const [form, setForm] = useState<any>({
    ...norwegianDefaults[investmentType]
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'monthsDelayed') {
      setForm({ ...form, [name]: String(value) });
    } else if (name === 'color') {
      setForm({ ...form, color: value });
    } else if (name === 'effectiveInterestRate') {
      setForm({ ...form, effectiveInterestRate: value });
    } else if (name === 'rateType') {
      setForm({ ...form, rateType: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as InvestmentType;
    setInvestmentType(newType);
    setForm({
      ...norwegianDefaults[newType]
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
        parseInt(form.monthsDelayed || '0'),
        color
      );
    }
    if (newInvestment) {
      setInvestments(prev => [...prev, newInvestment]);
      setForm({
        ...norwegianDefaults[investmentType]
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
  const getChartData = (useTaxed: boolean) => {
    const data: any[] = [];
    const maxMonths = timelineMonths + 1;
    // Track which loans are still active for each month
    let activeLoanKeys: Set<string> = new Set(plan.loans.map(l => l.loanName));
    for (let m = 0; m < maxMonths; m++) {
      const entry: any = { month: m };
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
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && label !== undefined) {
      const hoveredData = payload && payload.length && payload[0].payload ? payload[0].payload : {};
      const total = typeof hoveredData.Total === 'number' ? hoveredData.Total : null;
      return (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Month: {label}</div>
          {payload && payload.length > 0 && payload.map((p: any) => (
            <div key={p.dataKey} style={{ color: p.color }}>
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
        if (field === 'name') return new Loan(id, value as string, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.monthsDelayed, inv.color);
        if (field === 'principal') return new Loan(id, inv.name, parseFloat(value as string), inv.yearlyRate, inv.effectiveRate, inv.years, inv.monthsDelayed, inv.color);
        if (field === 'effectiveInterestRate') return new Loan(id, inv.name, inv.principal, parseFloat(value as string) / 100, inv.effectiveRate, inv.years, inv.monthsDelayed, inv.color);
        if (field === 'years') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, parseInt(value as string), inv.monthsDelayed, inv.color);
        if (field === 'monthsDelayed') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, parseInt(value as string), inv.color);
        if (field === 'color') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, inv.effectiveRate, inv.years, inv.monthsDelayed, value as string);
        if (field === 'rateType') return new Loan(id, inv.name, inv.principal, inv.yearlyRate, value === 'effective', inv.years, inv.monthsDelayed, inv.color);
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Investment Planner</h1>
      <h2>Add Investment</h2>
      <form onSubmit={handleFormSubmit} style={{ marginBottom: 20 }}>
        <label>
          Type:
          <select name="type" value={investmentType} onChange={handleTypeChange}>
            <option value="Property">Property</option>
            <option value="Stock">Stock</option>
            <option value="Loan">Loan</option>
          </select>
        </label>
        <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} required />{' '}
        {investmentType === 'Property' && (
          <>
            <input name="initialValue" placeholder="Initial Value" type="number" value={form.initialValue} onChange={handleFormChange} step="any" required />{' '}
            <input name="expectedReturn" placeholder="Yearly Increase (%)" type="number" value={form.expectedReturn} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
            <input name="taxRate" placeholder="Tax Rate (%)" type="number" value={form.taxRate} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
            <input name="color" type="color" value={form.color || '#8884d8'} onChange={handleFormChange} style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }} title="Pick a color" />
          </>
        )}
        {investmentType === 'Stock' && (
          <>
            <input name="initialValue" placeholder="Initial Value" type="number" value={form.initialValue} onChange={handleFormChange} step="any" required />{' '}
            <input name="expectedReturn" placeholder="Yearly Increase (%)" type="number" value={form.expectedReturn} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
            <input name="taxRate" placeholder="Tax Rate (%)" type="number" value={form.taxRate} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
            <input name="color" type="color" value={form.color || '#82ca9d'} onChange={handleFormChange} style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }} title="Pick a color" />
          </>
        )}
        {investmentType === 'Loan' && (
          <>
            <input name="principal" placeholder="Principal" type="number" value={form.principal} onChange={handleFormChange} step="any" required />{' '}
            <input name="effectiveInterestRate" placeholder="Effective Interest Rate (%)" type="number" value={form.effectiveInterestRate} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
            <input name="years" placeholder="Years" type="number" value={form.years} onChange={handleFormChange} required />{' '}
            <input name="monthsDelayed" placeholder="Delayed Months" type="number" value={typeof form.monthsDelayed === 'string' ? form.monthsDelayed : String(form.monthsDelayed ?? '')} onChange={handleFormChange} min={0} />{' '}
            <input name="color" type="color" value={form.color || '#ff7300'} onChange={handleFormChange} style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }} title="Pick a color" />
          </>
        )}
        {(investmentType === 'Property' || investmentType === 'Stock' || investmentType === 'Loan') && (
          <div style={{ display: 'inline-block', marginLeft: 8, marginRight: 8 }}>
            <label style={{ marginRight: 4 }}>Rate type:</label>
            <label>
              <input
                type="radio"
                name="rateType"
                value="nominal"
                checked={form.rateType === 'nominal'}
                onChange={handleFormChange}
              /> Nominal
            </label>
            <label style={{ marginLeft: 8 }}>
              <input
                type="radio"
                name="rateType"
                value="effective"
                checked={form.rateType === 'effective'}
                onChange={handleFormChange}
              /> Effective
            </label>
          </div>
        )}
        <button type="submit">Add</button>
      </form>
      <div style={{ margin: '20px 0' }}>
        <label>
          Timeline (months):
          <input
            type="number"
            min={1}
            max={600}
            value={timelineMonths}
            onChange={e => setTimelineMonths(Number(e.target.value))}
            style={{ width: 80, marginLeft: 8 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>
          Monthly Income:
          <input
            type="number"
            value={income}
            onChange={e => setIncome(e.target.value)}
            style={{ marginLeft: 8, width: 120 }}
            min={0}
          />
        </label>
        <label style={{ marginLeft: 24 }}>
          Yearly Inflation (%):
          <input
          type="number"
          step="any"
          min="0"
          value={inflation}
          onChange={e => setInflation(e.target.value)}
          style={{ marginLeft: 8, width: 80 }}
    />
  </label>
      </div>
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
                      checked={inv.effectiveRate === false}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                    /> Nominal
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    <input
                      type="radio"
                      name="rateType"
                      value="effective"
                      checked={inv.effectiveRate !== false}
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
                      checked={inv.effectiveRate === false}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                    /> Nominal
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    <input
                      type="radio"
                      name="rateType"
                      value="effective"
                      checked={inv.effectiveRate !== false}
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
                      checked={inv.effectiveRate === false}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                    /> Nominal
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    <input
                      type="radio"
                      name="rateType"
                      value="effective"
                      checked={inv.effectiveRate !== false}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'effective')}
                    /> Effective
                  </label>
                </span>
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.years)} onChange={e => handleInvestmentEdit(inv.id, 'years', e.target.value)} /> (Years)
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
    </div>
  )
}

export default App
