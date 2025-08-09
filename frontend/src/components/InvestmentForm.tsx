import { useState } from 'react';
import { Property, Stock, Loan, StudentLoan } from '../models';

type InvestmentType = 'Property' | 'Stock' | 'Loan' | 'Student Loan';

type FormState = {
  name: string;
  initialValue: string;
  currentValue: string;
  expectedReturn: string;
  taxRate: string;
  principal: string;
  effectiveInterestRate: string;
  years: string;
  months: string;
  monthlyInvestment: string;
  monthsDelayed: string;
  startMonths: string;
  color: string;
  rateType: 'effective' | 'nominal';
  downPayment: string;
  stockSourceId: string;
};

type InvestmentFormProps = {
  onAddInvestment: (investment: Property | Stock | Loan | StudentLoan) => void;
  stocks: Stock[];
};

const norwegianDefaults: Record<InvestmentType, Omit<FormState, 'months'>> = {
  Property: {
    name: 'Standard Apartment',
    initialValue: '4000000',
    currentValue: '4000000',
    expectedReturn: '3', // percent
    taxRate: '22',      // percent
    principal: '',
    effectiveInterestRate: '',
    years: '',
    monthlyInvestment: '',
    monthsDelayed: '',
    startMonths: '0',
    color: '#1f77b4',
    rateType: 'effective',
    downPayment: '',
    stockSourceId: '',
  },
  Stock: {
    name: 'Index Fund',
    initialValue: '100000',
    currentValue: '100000',
    expectedReturn: '7', // percent
    taxRate: '22',      // percent
    principal: '',
    effectiveInterestRate: '',
    years: '',
    monthlyInvestment: '',
    monthsDelayed: '',
    startMonths: '0',
    color: '#2ca02c',
    rateType: 'effective',
    downPayment: '',
    stockSourceId: '',
  },
  Loan: {
    name: 'Mortgage',
    initialValue: '',
    currentValue: '',
    expectedReturn: '',
    taxRate: '',
    principal: '3000000',
    effectiveInterestRate: '5', // percent
    years: '25',
    monthlyInvestment: '',
    monthsDelayed: '0',
    startMonths: '0',
    color: '#d62728',
    rateType: 'effective',
    downPayment: '0',
    stockSourceId: '',
  },
  'Student Loan': {
    name: 'Student Loan',
    initialValue: '',
    currentValue: '',
    expectedReturn: '',
    taxRate: '',
    principal: '50000',
    effectiveInterestRate: '4.5', // percent
    years: '10',
    monthlyInvestment: '',
    monthsDelayed: '0',
    startMonths: '0',
    color: '#9467bd',
    rateType: 'effective',
    downPayment: '0',
    stockSourceId: '',
  },
};

const InvestmentForm = ({ onAddInvestment, stocks }: InvestmentFormProps) => {
  const [investmentType, setInvestmentType] = useState<InvestmentType>('Property');

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

      // Expanded color palette for random assignment
      const expandedColors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173', '#5254a3', '#9c9ede', '#cedb9c', '#e7ba52', '#ad494a', '#a55194',
    '#6b6ecf', '#b5cf6b', '#bd9e39', '#bd9e39', '#ce6dbd', '#de9ed6', '#393b79', '#637939', '#8c6d31', '#843c39',
      ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newInvestment: Property | Stock | Loan | StudentLoan | null = null;
    const id = crypto.randomUUID();
    // Assign a random color if none selected
    const color = form.color || expandedColors[Math.floor(Math.random() * expandedColors.length)];
    const isEffective = form.rateType === 'effective';

    if (investmentType === 'Property') {
      newInvestment = new Property(
        id,
        form.name,
        parseInt(form.startMonths || '0'),
        parseFloat(form.initialValue),
        parseFloat(form.currentValue),
        parseFloat(form.expectedReturn) / 100, // convert percent to decimal
        isEffective,
        parseFloat(form.taxRate) / 100,        // convert percent to decimal
        color
      );
    } else if (investmentType === 'Stock') {
      newInvestment = new Stock(
        id,
        form.name,
        parseInt(form.startMonths || '0'),
        parseFloat(form.initialValue),
        parseFloat(form.currentValue),
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
        parseInt(form.startMonths || '0'),
        color,
        parseFloat(form.downPayment || '0'), // Now using absolute value instead of percentage
        form.stockSourceId || null // Stock source ID
      );
    } else if (investmentType === 'Student Loan') {
      newInvestment = new StudentLoan(
        id,
        form.name,
        parseFloat(form.principal),
        parseFloat(form.effectiveInterestRate) / 100, // convert percent to decimal
        isEffective,
        parseInt(form.years),
        parseInt(form.months || '0'), // Include months in the calculation
        parseInt(form.monthsDelayed || '0'),
        parseInt(form.startMonths || '0'),
        color
      );
    }

    if (newInvestment) {
      onAddInvestment(newInvestment);
      // Reset form to defaults
      setForm({
        ...norwegianDefaults[investmentType],
        months: '',
      });
    }
  };

  // expandedColors is now defined before use in handleFormSubmit

  return (
    <section className="card form-container">
      <h2>Add Investment</h2>
      <form onSubmit={handleFormSubmit} className="investment-form" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label>Type:</label>
          <select name="type" value={investmentType} onChange={handleTypeChange}>
            <option value="Property">Property</option>
            <option value="Stock">Stock</option>
            <option value="Loan">Loan</option>
            <option value="Student Loan">Student Loan</option>
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
              <label>Current Value:</label>
              <input name="currentValue" placeholder="Current Value" type="number" value={form.currentValue} onChange={handleFormChange} step="any" required />
            </div>
            <div className="form-group">
              <label>Start Month:</label>
              <input name="startMonths" placeholder="Start Month" type="number" value={form.startMonths} onChange={handleFormChange} min={0} />
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
                    id="rate-type-nominal-loan"
                  /> Nominal
                </label>
                <label>
                  <input
                    type="radio"
                    name="rateType"
                    value="effective"
                    checked={form.rateType === 'effective'}
                    onChange={handleFormChange}
                    id="rate-type-effective-loan"
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
              <label>Current Value:</label>
              <input name="currentValue" placeholder="Current Value" type="number" value={form.currentValue} onChange={handleFormChange} step="any" required />
            </div>
            <div className="form-group">
              <label>Start Month:</label>
              <input name="startMonths" placeholder="Start Month" type="number" value={form.startMonths} onChange={handleFormChange} min={0} />
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
                    id="rate-type-nominal-property"
                  /> Nominal
                </label>
                <label>
                  <input
                    type="radio"
                    name="rateType"
                    value="effective"
                    checked={form.rateType === 'effective'}
                    onChange={handleFormChange}
                    id="rate-type-effective-property"
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

        {(investmentType === 'Loan' || investmentType === 'Student Loan') && (
          <>
            <div className="form-group">
              <label>Principal:</label>
              <input name="principal" placeholder="Principal" type="number" value={form.principal} onChange={handleFormChange} step="any" required />
            </div>
            <div className="form-group">
              <label>Start Month:</label>
              <input name="startMonths" placeholder="Start Month" type="number" value={form.startMonths} onChange={handleFormChange} min={0} />
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
            {investmentType === 'Loan' && (
              <>
                <div className="form-group">
                  <label>Down Payment:</label>
                  <input name="downPayment" placeholder="Down Payment Amount" type="number" value={form.downPayment} onChange={handleFormChange} step="any" min={0} />
                </div>
                <div className="form-group">
                  <label>Source of Down Payment:</label>
                  <select name="stockSourceId" value={form.stockSourceId} onChange={handleFormChange}>
                    <option value="">None (External funds)</option>
                    {stocks.map(stock => (
                      <option key={stock.id} value={stock.id}>{stock.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
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
                    id="rate-type-nominal-stock"
                  /> Nominal
                </label>
                <label>
                  <input
                    type="radio"
                    name="rateType"
                    value="effective"
                    checked={form.rateType === 'effective'}
                    onChange={handleFormChange}
                    id="rate-type-effective-stock"
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
  );
};

export default InvestmentForm;
