import { Property, Stock, Loan, StudentLoan } from '../models';
import type { MonthlyPlan } from '../financeLogic';

type InvestmentListProps = {
  investments: Array<Property | Stock | Loan | StudentLoan>;
  handleInvestmentRemove: (id: string) => void;
  handleInvestmentEdit: (id: string, field: string, value: string | number | boolean) => void;
  plan: MonthlyPlan;
  loans: Loan[];
  stocks: Stock[];
};

const InvestmentList = ({
  investments,
  handleInvestmentRemove,
  handleInvestmentEdit,
  plan,
  loans,
  stocks
}: InvestmentListProps) => {
  return (
    <section className="card investments-section">
      <h2>Investments</h2>
      <ul>
        {investments.map((inv) => (
          <li key={inv.id}>
            {inv instanceof Property && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <b>Property:</b>
                  <button 
                    onClick={() => handleInvestmentRemove(inv.id)} 
                    className="remove-btn"
                    title="Remove investment"
                  >
                    &times;
                  </button>
                </div>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.initialValue)} onChange={e => handleInvestmentEdit(inv.id, 'initialValue', e.target.value)} /> (Initial Value)
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.currentValue)} onChange={e => handleInvestmentEdit(inv.id, 'currentValue', e.target.value)} /> (Current Value)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.startMonths)} onChange={e => handleInvestmentEdit(inv.id, 'startMonths', e.target.value)} /> (Start Month)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.taxRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
                <span style={{ marginLeft: 8 }}>
                  <label style={{ marginRight: 4 }}>Rate type:</label>
                  <label>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
                      value="nominal"
                      checked={!inv.effectiveRate}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                    /> Nominal
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <b>Stock:</b>
                  <button 
                    onClick={() => handleInvestmentRemove(inv.id)} 
                    className="remove-btn"
                    title="Remove investment"
                  >
                    &times;
                  </button>
                </div>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.initialValue)} onChange={e => handleInvestmentEdit(inv.id, 'initialValue', e.target.value)} /> (Initial Value)
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.currentValue)} onChange={e => handleInvestmentEdit(inv.id, 'currentValue', e.target.value)} /> (Current Value)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.startMonths)} onChange={e => handleInvestmentEdit(inv.id, 'startMonths', e.target.value)} /> (Start Month)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'expectedReturn', e.target.value)} />%
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.taxRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'taxRate', e.target.value)} />%
                <span style={{ marginLeft: 8 }}>
                  <label style={{ marginRight: 4 }}>Rate type:</label>
                  <label>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
                      value="nominal"
                      checked={!inv.effectiveRate}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                    /> Nominal
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
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
            {inv instanceof StudentLoan && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <b>Student Loan:</b>
                  <button 
                    onClick={() => handleInvestmentRemove(inv.id)} 
                    className="remove-btn"
                    title="Remove investment"
                  >
                    &times;
                  </button>
                </div>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.principal)} onChange={e => handleInvestmentEdit(inv.id, 'principal', e.target.value)} />
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.startMonths)} onChange={e => handleInvestmentEdit(inv.id, 'startMonths', e.target.value)} /> (Start Month)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'effectiveInterestRate', e.target.value)} />%
                <span style={{ marginLeft: 8 }}>
                  <label style={{ marginRight: 4 }}>Rate type:</label>
                  <label>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
                      value="nominal"
                      checked={!inv.effectiveRate}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                    /> Nominal
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
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
                  <div>
                    Monthly Payment: ${inv.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    {/* Show total loan cost if available in plan */}
                    {(() => {
                      const planLoan = plan.loans.find(l => l.loanName === inv.name);
                      return planLoan ? (
                        <span key={`loan-cost-${inv.id}`} style={{ marginLeft: 16 }}>
                          Total Cost: {planLoan.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      ) : null;
                    })()}
                  </div>
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
            {inv instanceof Loan && !(inv instanceof StudentLoan) && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <b>Loan:</b>
                  <button 
                    onClick={() => handleInvestmentRemove(inv.id)} 
                    className="remove-btn"
                    title="Remove investment"
                  >
                    &times;
                  </button>
                </div>
                <input style={{ marginLeft: 4, width: 100 }} value={inv.name} onChange={e => handleInvestmentEdit(inv.id, 'name', e.target.value)} />
                <input style={{ marginLeft: 4, width: 80 }} type="number" value={String(inv.principal)} onChange={e => handleInvestmentEdit(inv.id, 'principal', e.target.value)} />
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.startMonths)} onChange={e => handleInvestmentEdit(inv.id, 'startMonths', e.target.value)} /> (Start Month)
                <input style={{ marginLeft: 4, width: 60 }} type="number" value={String(inv.yearlyRate * 100)} onChange={e => handleInvestmentEdit(inv.id, 'effectiveInterestRate', e.target.value)} />%
                <span style={{ marginLeft: 8 }}>
                  <label style={{ marginRight: 4 }}>Rate type:</label>
                  <label>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
                      value="nominal"
                      checked={!inv.effectiveRate}
                      onChange={() => handleInvestmentEdit(inv.id, 'rateType', 'nominal')}
                    /> Nominal
                  </label>
                  <label style={{ marginLeft: 8 }}>
                    <input
                      type="radio"
                      name={`rateType-${inv.id}`}
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
                  <div>
                    Monthly Payment: ${inv.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    {/* Show total loan cost if available in plan */}
                    {(() => {
                      const planLoan = plan.loans.find(l => l.loanName === inv.name);
                      return planLoan ? (
                        <span key={`loan-cost-${inv.id}`} style={{ marginLeft: 16 }}>
                          Total Cost: {planLoan.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ marginRight: 8 }}>Down Payment:</span>
                    <input 
                      style={{ width: 80 }} 
                      type="number" 
                      value={String(inv.downPayment)} 
                      onChange={e => handleInvestmentEdit(inv.id, 'downPayment', e.target.value)}
                      min="0"
                      step="1000"
                    />
                    <span style={{ marginLeft: 16, marginRight: 8 }}>Source:</span>
                    <select 
                      value={inv.stockSourceId || ''} 
                      onChange={e => handleInvestmentEdit(inv.id, 'stockSourceId', e.target.value)}
                      style={{ marginRight: 8 }}
                    >
                      <option value="">None (External funds)</option>
                      {stocks.map(stock => (
                        <option key={stock.id} value={stock.id}>{stock.name}</option>
                      ))}
                    </select>
                    {inv.downPayment > 0 && inv.stockSourceId && (
                      <span>
                        Amount: {inv.downPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
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
  );
};

export default InvestmentList;
