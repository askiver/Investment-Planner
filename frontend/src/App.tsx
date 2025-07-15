import { useState } from 'react'
import './App.css'
import { Property, Stock, Loan, Asset } from './models'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function NewPage() {
  return (
    <div>
      <h2>Welcome to the New Page!</h2>
      <p>This is a new page visible from the root of the site.</p>
    </div>
  );
}

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
    studentLoan: false,
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
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
      studentLoan: false,
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
        parseFloat(form.taxRate) / 100         // convert percent to decimal
      );
    } else if (investmentType === 'Loan') {
      newInvestment = new Loan(
        id,
        form.name,
        parseFloat(form.principal),
        parseFloat(form.nominalInterestRate) / 100, // convert percent to decimal
        parseInt(form.years),
        form.studentLoan
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
        studentLoan: false,
      });
    }
  };

  // Calculate portfolio value over time
  const calculatePortfolioOverTime = () => {
    // For each month, sum the projected value of all investments
    const monthlyTotals: number[] = Array(timelineMonths).fill(0);
    investments.forEach(inv => {
      if (inv instanceof Property || inv instanceof Stock) {
        const values = (inv as Asset).projectedValue(timelineMonths, false);
        for (let i = 0; i < timelineMonths; i++) {
          monthlyTotals[i] += values[i];
        }
      } else if (inv instanceof Loan) {
        // For loans, subtract the remaining principal over time
        // We'll assume the principal is paid down linearly for simplicity
        // (You can improve this with amortization logic if desired)
        const principal = inv.principal;
        const monthlyPayment = inv.monthlyPayment;
        let remaining = principal;
        for (let i = 0; i < timelineMonths; i++) {
          monthlyTotals[i] -= Math.max(remaining, 0);
          remaining -= monthlyPayment;
        }
      }
    });
    return monthlyTotals;
  };
  const portfolioOverTime = calculatePortfolioOverTime();

  // Prepare data for stacked area chart (without tax)
  const getChartData = () => {
    const data: any[] = [];
    const assetKeys = investments
      .filter(inv => inv instanceof Property || inv instanceof Stock)
      .map((inv, idx) => inv.name || `Asset${idx + 1}`);
    for (let i = 0; i < timelineMonths; i++) {
      const entry: any = { month: i };
      let runningTotal = 0;
      let loanTotal = 0;
      investments.forEach((inv, idx) => {
        if (inv instanceof Property || inv instanceof Stock) {
          const values = (inv as Asset).projectedValue(timelineMonths, false);
          entry[inv.name || `Asset${idx + 1}`] = values[i];
          runningTotal += values[i];
        } else if (inv instanceof Loan) {
          const principal = inv.principal;
          const monthlyPayment = inv.monthlyPayment;
          let remaining = principal - monthlyPayment * i;
          entry[inv.name || `Loan${idx + 1}`] = -Math.max(remaining, 0);
          loanTotal += Math.max(remaining, 0);
        }
      });
      entry['Total'] = runningTotal - loanTotal;
      data.push(entry);
    }
    return { data, assetKeys };
  };
  const { data: chartData, assetKeys } = getChartData();

  // Prepare data for stacked area chart (with tax)
  const getChartDataWithTax = () => {
    const data: any[] = [];
    const assetKeys = investments
      .filter(inv => inv instanceof Property || inv instanceof Stock)
      .map((inv, idx) => inv.name || `Asset${idx + 1}`);
    for (let i = 0; i < timelineMonths; i++) {
      const entry: any = { month: i };
      let runningTotal = 0;
      let loanTotal = 0;
      investments.forEach((inv, idx) => {
        if (inv instanceof Property || inv instanceof Stock) {
          const values = (inv as Asset).projectedValue(timelineMonths, true);
          entry[inv.name || `Asset${idx + 1}`] = values[i];
          runningTotal += values[i];
        } else if (inv instanceof Loan) {
          const principal = inv.principal;
          const monthlyPayment = inv.monthlyPayment;
          let remaining = principal - monthlyPayment * i;
          entry[inv.name || `Loan${idx + 1}`] = -Math.max(remaining, 0);
          loanTotal += Math.max(remaining, 0);
        }
      });
      entry['Total'] = runningTotal - loanTotal;
      data.push(entry);
    }
    return { data, assetKeys };
  };
  const { data: chartDataWithTax, assetKeys: assetKeysWithTax } = getChartDataWithTax();

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
            <label>
              <input name="studentLoan" type="checkbox" checked={form.studentLoan} onChange={handleFormChange} /> Student Loan
            </label>
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
          <Tooltip />
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
          <Tooltip />
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
        </AreaChart>
      </ResponsiveContainer>
      <h2>Investments</h2>
      <ul>
        {investments.map((inv, idx) => (
          <li key={inv.id}>
            {inv instanceof Property && (
              <>
                <b>Property:</b> {inv.name} (${inv.initialValue}) @ {Number(inv.yearlyIncrease) * 100}%/yr, Tax: {Number(inv.taxRate) * 100}%{inv.primaryResidence ? ', Primary Residence' : ''}
              </>
            )}
            {inv instanceof Stock && (
              <>
                <b>Stock:</b> {inv.name} (${inv.initialValue}) @ {Number(inv.yearlyIncrease) * 100}%/yr, Tax: {Number(inv.taxRate) * 100}%
              </>
            )}
            {inv instanceof Loan && (
              <>
                <b>Loan:</b> {inv.name} (${inv.principal}) @ {Number(inv.nominalInterestRate) * 100}%/yr, {inv.years} years{inv.studentLoan ? ', Student Loan' : ''}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
