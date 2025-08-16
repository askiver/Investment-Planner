// src/components/investment-form/index.tsx
import { useState } from 'react';
import type { InvestmentType } from './types';
import PropertyForm from './forms/PropertyForm';
import StockForm from './forms/StockForm';
import LoanForm from './forms/LoanForm';
import StudentLoanForm from './forms/StudentLoanForm';
import type { Property, Stock, Loan, StudentLoan } from '@/models';
import './investment-form.css';

type Props = {
  onAddInvestment: (i: Property | Stock | Loan | StudentLoan) => void;
  stocks: Stock[];
};

export default function InvestmentForm({ onAddInvestment, stocks }: Props) {
  const [type, setType] = useState<InvestmentType>('Property');

  return (
    <section className="card form-container">
      <h2>Add Investment</h2>

      {/* Wrap *both* the type selector and the chosen subform */}
      <div className="investment-form">
        <div className="form-group">
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value as InvestmentType)}>
            <option value="Property">Property</option>
            <option value="Stock">Stock</option>
            <option value="Loan">Loan</option>
            <option value="Student Loan">Student Loan</option>
          </select>
        </div>

        {type === 'Property' && <PropertyForm key="Property" onSubmit={(p) => onAddInvestment(p)} />}
        {type === 'Stock' && <StockForm key="Stock" onSubmit={(s) => onAddInvestment(s)} />}
        {type === 'Loan' && <LoanForm key="Loan" stocks={stocks} onSubmit={(l) => onAddInvestment(l)} />}
        {type === 'Student Loan' && <StudentLoanForm key="StudentLoan" onSubmit={(sl) => onAddInvestment(sl)} />}
      </div>
    </section>
  );
}
