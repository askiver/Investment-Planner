import { useState } from 'react'
import './App.css'
import { Property, Stock, Loan } from './models'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { calculateMonthlyPlan } from './financeLogic';
import type { MonthlyPlan } from './financeLogic';


type InvestmentType = 'Property' | 'Stock' | 'Loan';
type Investment = Property | Stock | Loan;

function App() {
  const [investmentType, setInvestmentType] = useState<InvestmentType>('Property');
  const [investments, setInvestments] = useState<Array<Property | Stock | Loan>>([]);
  const [timelineMonths, setTimelineMonths] = useState(12);
  const [income, setIncome] = useState('');

  // Form state
  const [form, setForm] = useState<any>({
    name: '',
    initialValue: '',
    expectedReturn: '', // as percent
    taxRate: '',        // as percent
    primaryResidence: false,
    principal: '',
    nominalInterestRate: '', // as percent
    years: '',
    monthlyInvestment: '', // for stocks
    monthsDelayed: '', // for loans
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'monthsDelayed') {
      setForm({ ...form, [name]: String(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInvestmentType(e.target.value as InvestmentType);
    setForm({
      name: '',
      initialValue: '',
      expectedReturn: '',
      taxRate: '',
      primaryResidence: false,
      location: '',
      principal: '',
      nominalInterestRate: '',
      years: '',
      monthlyInvestment: '',
      monthsDelayed: '',
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newInvestment: Investment | null = null;
    const id = crypto.randomUUID();
    if (investmentType === 'Property') {
      newInvestment = new Property(
        id,
        form.name,
        parseFloat(form.initialValue),
        parseFloat(form.expectedReturn) / 100, // convert percent to decimal
        parseFloat(form.taxRate) / 100,        // convert percent to decimal
        form.primaryResidence
      );
    } else if (investmentType === 'Stock') {
      newInvestment = new Stock(
        id,
        form.name,
        parseFloat(form.initialValue),
        parseFloat(form.expectedReturn) / 100, // convert percent to decimal
        parseFloat(form.taxRate) / 100,        // convert percent to decimal
      );
    } else if (investmentType === 'Loan') {
      newInvestment = new Loan(
        id,
        form.name,
        parseFloat(form.principal),
        parseFloat(form.nominalInterestRate) / 100, // convert percent to decimal
        parseInt(form.years),
        parseInt(form.monthsDelayed || '0')
      );
    }
    if (newInvestment) {
      setInvestments(prev => [...prev, newInvestment]);
      setForm({
        name: '',
        initialValue: '',
        expectedReturn: '',
        taxRate: '',
        primaryResidence: false,
        principal: '',
        nominalInterestRate: '',
        years: '',
        monthlyInvestment: '',
        monthsDelayed: '', // always reset as string
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
    timelineMonths
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
      // Loans
      plan.loans.forEach(loanPlan => {
        const principal = loanPlan.principals[m] ?? 0;
        if (principal > 0) {
          entry[loanPlan.loanName] = principal;
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
    const loanKeys = plan.loans.map(l => l.loanName).filter(name => data.some(entry => entry[name] > 0));
    return {
      data,
      assetKeys: plan.stockInvestments.map(s => s.assetName).concat(plan.propertyInvestments.map(p => p.assetName)),
      loanKeys
    };
  };
  const { data: chartData, assetKeys, loanKeys } = getChartData(false);
  const { data: chartDataWithTax, assetKeys: assetKeysWithTax, loanKeys: loanKeysWithTax } = getChartData(true);

  // Type guard for loans with loanValue
  function hasLoanValue(loan: any): loan is Loan & { loanValue: (months: number) => [number[], number[]] } {
    return typeof loan.loanValue === 'function';
  }

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
        if (field === 'name') return new Property(id, value as string, inv.initialValue, inv.yearlyIncrease, inv.taxRate, inv.primaryResidence);
        if (field === 'initialValue') return new Property(id, inv.name, parseFloat(value as string), inv.yearlyIncrease, inv.taxRate, inv.primaryResidence);
        if (field === 'expectedReturn') return new Property(id, inv.name, inv.initialValue, parseFloat(value as string) / 100, inv.taxRate, inv.primaryResidence);
        if (field === 'taxRate') return new Property(id, inv.name, inv.initialValue, inv.yearlyIncrease, parseFloat(value as string) / 100, inv.primaryResidence);
        if (field === 'primaryResidence') return new Property(id, inv.name, inv.initialValue, inv.yearlyIncrease, inv.taxRate, value as boolean);
        return inv;
      }
      if (inv instanceof Stock) {
        if (field === 'name') return new Stock(id, value as string, inv.initialValue, inv.yearlyIncrease, inv.taxRate);
        if (field === 'initialValue') return new Stock(id, inv.name, parseFloat(value as string), inv.yearlyIncrease, inv.taxRate);
        if (field === 'expectedReturn') return new Stock(id, inv.name, inv.initialValue, parseFloat(value as string) / 100, inv.taxRate);
        if (field === 'taxRate') return new Stock(id, inv.name, inv.initialValue, inv.yearlyIncrease, parseFloat(value as string) / 100);
        return inv;
      }
      if (inv instanceof Loan) {
        if (field === 'name') return new Loan(id, value as string, inv.principal, inv.nominalInterestRate, inv.years, inv.monthsDelayed);
        if (field === 'principal') return new Loan(id, inv.name, parseFloat(value as string), inv.nominalInterestRate, inv.years, inv.monthsDelayed);
        if (field === 'nominalInterestRate') return new Loan(id, inv.name, inv.principal, parseFloat(value as string) / 100, inv.years, inv.monthsDelayed);
        if (field === 'years') return new Loan(id, inv.name, inv.principal, inv.nominalInterestRate, parseInt(value as string), inv.monthsDelayed);
        if (field === 'monthsDelayed') return new Loan(id, inv.name, inv.principal, inv.nominalInterestRate, inv.years, parseInt(value as string));
        return inv;
      }
      return inv;
    }));
  };

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
            <label>
              <input name="primaryResidence" type="checkbox" checked={form.primaryResidence} onChange={handleFormChange} /> Primary Residence
            </label>{' '}
          </>
        )}
        {investmentType === 'Stock' && (
          <>
            <input name="initialValue" placeholder="Initial Value" type="number" value={form.initialValue} onChange={handleFormChange} step="any" required />{' '}
            <input name="expectedReturn" placeholder="Yearly Increase (%)" type="number" value={form.expectedReturn} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
            <input name="taxRate" placeholder="Tax Rate (%)" type="number" value={form.taxRate} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
          </>
        )}
        {investmentType === 'Loan' && (
          <>
            <input name="principal" placeholder="Principal" type="number" value={form.principal} onChange={handleFormChange} step="any" required />{' '}
            <input name="nominalInterestRate" placeholder="Nominal Interest Rate (%)" type="number" value={form.nominalInterestRate} onChange={handleFormChange} step="any" min={0} max={100} required />{' '}
            <input name="years" placeholder="Years" type="number" value={form.years} onChange={handleFormChange} required />{' '}
            <input name="monthsDelayed" placeholder="Delayed Months" type="number" value={typeof form.monthsDelayed === 'string' ? form.monthsDelayed : String(form.monthsDelayed ?? '')} onChange={handleFormChange} min={0} />{' '}
          </>
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
      </div>
      <h2>Portfolio Value Over Time (No Tax)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {assetKeys.map((key, idx) => (
              <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={idx % 2 === 0 ? '#8884d8' : '#82ca9d'} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={idx % 2 === 0 ? '#8884d8' : '#82ca9d'} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={CustomTooltip} />
          <Legend />
          {assetKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={idx % 2 === 0 ? '#8884d8' : '#82ca9d'}
              fill={`url(#color${key})`}
              isAnimationActive={false}
            />
          ))}
          {loanKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={idx % 2 === 0 ? '#d62728' : '#9467bd'}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <h2>Portfolio Value Over Time (With Tax)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartDataWithTax} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {assetKeysWithTax.map((key, idx) => (
              <linearGradient key={key} id={`colorTax${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={idx % 2 === 0 ? '#ff7300' : '#387908'} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={idx % 2 === 0 ? '#ff7300' : '#387908'} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={CustomTooltip} />
          <Legend />
          {assetKeysWithTax.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={idx % 2 === 0 ? '#ff7300' : '#387908'}
              fill={`url(#colorTax${key})`}
              isAnimationActive={false}
            />
          ))}
          {loanKeysWithTax.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={idx % 2 === 0 ? '#d62728' : '#9467bd'}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
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
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyIncrease * 100)} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.taxRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
                <label style={{ marginLeft: 8 }}>
                  <input type="checkbox" checked={inv.primaryResidence} onChange={e => handleInvestmentEdit(inv.id, 'primaryResidence', e.target.checked)} /> Primary Residence
                </label>
              </>
            )}
            {inv instanceof Stock && (
              <>
                <b>Stock:</b>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.initialValue)} onChange={e => handleInvestmentEdit(inv.id, 'initialValue', e.target.value)} />
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyIncrease * 100)} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.taxRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
              </>
            )}
            {inv instanceof Loan && (
              <>
                <b>Loan:</b>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.principal)} onChange={e => handleInvestmentEdit(inv.id, 'principal', e.target.value)} />
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.nominalInterestRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'nominalInterestRate', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.years)} onChange={e => handleInvestmentEdit(inv.id, 'years', e.target.value)} /> (Years)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.monthsDelayed)} onChange={e => handleInvestmentEdit(inv.id, 'monthsDelayed', e.target.value)} /> (Delayed Months)
                <div style={{ marginLeft: 16, color: '#555' }}>
                  Monthly Payment: ${
                    inv.calculateMonthlyPayment(
                      inv.years,
                      inv.monthsDelayed
                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })
                  }
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
