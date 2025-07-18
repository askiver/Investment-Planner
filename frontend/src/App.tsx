import { useState } from 'react'
import './App.css'
import { Property, Stock, Loan, Asset } from './models'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';


type InvestmentType = 'Property' | 'Stock' | 'Loan';
type Investment = Property | Stock | Loan;

function App() {
  const [investmentType, setInvestmentType] = useState<InvestmentType>('Property');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [timelineMonths, setTimelineMonths] = useState(12);

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
        parseFloat(form.monthlyInvestment) || 0
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

  // Prepare data for stacked area chart (without tax)
  const getChartData = () => {
    const data: any[] = [];
    const assetKeys = investments
      .filter(inv => inv instanceof Property || inv instanceof Stock)
      .map((inv, idx) => inv.name || `Asset${idx + 1}`);
    const loanKeys = investments
      .map((inv, idx) => (inv instanceof Loan ? inv.name || `Loan${idx + 1}` : null))
      .filter((k): k is string => !!k);
    for (let i = 0; i < timelineMonths; i++) {
      const entry: any = { month: i };
      let runningTotal = 0;
      let loanTotal = 0;
      investments.forEach((inv, idx) => {
        if (inv instanceof Property || inv instanceof Stock) {
          const values = (inv as Asset).projectedValue(timelineMonths, false, inv instanceof Stock ? parseFloat(inv.monthlyInvestment) || 0 : 0);
          entry[inv.name || `Asset${idx + 1}`] = values[i];
          runningTotal += values[i];
        } else if (inv instanceof Loan) {
          const balances = hasLoanValue(inv)
            ? inv.loanValue(timelineMonths)[0]
            : Array(timelineMonths + 1).fill((inv as Loan).principal);
          const loanValue = balances[i] !== undefined ? Math.max(balances[i], 0) : 0; // positive for graph
          if (loanValue > 0) {
            entry[inv.name || `Loan${idx + 1}`] = loanValue;
          }
          loanTotal += loanValue; // subtract from total
        }
      });
      entry['Total'] = runningTotal - loanTotal;
      data.push(entry);
    }
    return { data, assetKeys, loanKeys };
  };
  const { data: chartData, assetKeys, loanKeys } = getChartData();

  // Prepare data for stacked area chart (with tax)
  const getChartDataWithTax = () => {
    const data: any[] = [];
    const assetKeys = investments
      .filter(inv => inv instanceof Property || inv instanceof Stock)
      .map((inv, idx) => inv.name || `Asset${idx + 1}`);
    const loanKeys = investments
      .map((inv, idx) => (inv instanceof Loan ? inv.name || `Loan${idx + 1}` : null))
      .filter((k): k is string => !!k);
    for (let i = 0; i < timelineMonths; i++) {
      const entry: any = { month: i };
      let runningTotal = 0;
      let loanTotal = 0;
      investments.forEach((inv, idx) => {
        if (inv instanceof Property || inv instanceof Stock) {
          const values = (inv as Asset).projectedValue(timelineMonths, true, inv instanceof Stock ? parseFloat(inv.monthlyInvestment) || 0 : 0);
          entry[inv.name || `Asset${idx + 1}`] = values[i];
          runningTotal += values[i];
        } else if (inv instanceof Loan) {
          const balances = hasLoanValue(inv)
            ? inv.loanValue(timelineMonths)[0]
            : Array(timelineMonths + 1).fill((inv as Loan).principal);
          const loanValue = balances[i] !== undefined ? Math.max(balances[i], 0) : 0; // positive for graph
          if (loanValue > 0) {
            entry[inv.name || `Loan${idx + 1}`] = loanValue;
          }
          loanTotal += loanValue; // subtract from total
        }
      });
      entry['Total'] = runningTotal - loanTotal;
      data.push(entry);
    }
    return { data, assetKeys, loanKeys };
  };
  const { data: chartDataWithTax, assetKeys: assetKeysWithTax, loanKeys: loanKeysWithTax } = getChartDataWithTax();

  // Type guard for loans with loanValue
  function hasLoanValue(loan: any): loan is Loan & { loanValue: (months: number) => [number[], number[]] } {
    return typeof loan.loanValue === 'function';
  }

  // Custom tooltip to show total
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].payload) {
      const hoveredData = payload[0].payload;
      console.log('Hovered data:', hoveredData); // Debug log
      const total = typeof hoveredData.Total === 'number' ? hoveredData.Total : null;
      return (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8 }}>
          <div><b>Month:</b> {label}</div>
          {payload.map((p: any) => (
            <div key={p.dataKey} style={{ color: p.color }}>
              {p.name}: {p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          ))}
          {/* Always show the total, even if not in payload */}
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
        if (field === 'name') return new Stock(id, value as string, inv.initialValue, inv.yearlyIncrease, inv.taxRate, inv.monthlyInvestment);
        if (field === 'initialValue') return new Stock(id, inv.name, parseFloat(value as string), inv.yearlyIncrease, inv.taxRate, inv.monthlyInvestment);
        if (field === 'expectedReturn') return new Stock(id, inv.name, inv.initialValue, parseFloat(value as string) / 100, inv.taxRate, inv.monthlyInvestment);
        if (field === 'taxRate') return new Stock(id, inv.name, inv.initialValue, inv.yearlyIncrease, parseFloat(value as string) / 100, inv.monthlyInvestment);
        if (field === 'monthlyInvestment') return new Stock(id, inv.name, inv.initialValue, inv.yearlyIncrease, inv.taxRate, parseFloat(value as string));
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
            <input name="monthlyInvestment" placeholder="Monthly Investment" type="number" value={form.monthlyInvestment} onChange={handleFormChange} step="any" min={0} />{' '}
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
          <Tooltip content={<CustomTooltip />} />
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
          <Tooltip content={<CustomTooltip />} />
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
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={inv.initialValue} onChange={e => handleInvestmentEdit(inv.id, 'initialValue', e.target.value)} />
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={inv.yearlyIncrease * 100} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={inv.taxRate * 100} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
                <label style={{ marginLeft: 8 }}>
                  <input type="checkbox" checked={inv.primaryResidence} onChange={e => handleInvestmentEdit(inv.id, 'primaryResidence', e.target.checked)} /> Primary Residence
                </label>
              </>
            )}
            {inv instanceof Stock && (
              <>
                <b>Stock:</b>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={inv.initialValue} onChange={e => handleInvestmentEdit(inv.id, 'initialValue', e.target.value)} />
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={inv.yearlyIncrease * 100} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={inv.taxRate * 100} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={inv.monthlyInvestment} onChange={e => handleInvestmentEdit(inv.id, 'monthlyInvestment', e.target.value)} /> (Monthly Investment)
              </>
            )}
            {inv instanceof Loan && (
              <>
                <b>Loan:</b>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={inv.principal} onChange={e => handleInvestmentEdit(inv.id, 'principal', e.target.value)} />
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={inv.nominalInterestRate * 100} onChange={e => handleInvestmentEdit(inv.id, 'nominalInterestRate', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={inv.years} onChange={e => handleInvestmentEdit(inv.id, 'years', e.target.value)} /> (Years)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={inv.monthsDelayed} onChange={e => handleInvestmentEdit(inv.id, 'monthsDelayed', e.target.value)} /> (Delayed Months)
                <div style={{ marginLeft: 16, color: '#555' }}>
                  Monthly Payment: ${
                    Loan.calculateMonthlyPayment(
                      inv.principal,
                      inv.nominalInterestRate,
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
