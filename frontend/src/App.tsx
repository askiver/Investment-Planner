// src/App.tsx
import { useMemo, useCallback, useReducer, useState } from 'react';
import './App.css';
import { Property, Stock, Loan, StudentLoan } from './models';
import { calculateMonthlyPlan, type MonthlyPlan } from './financeLogic';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import SettingsPanel from './components/SettingsPanel';
import InvestmentForm from './components/investment-form';
import ChartSection from './components/ChartSection';
import InvestmentList from './components/investment-edit';

// Utils
import { expandedColors } from './utils/colorPalette';
import { investmentsReducer, type InvestmentAction } from './state/investmentsReducer';

type InvestmentAny = Property | Stock | Loan | StudentLoan;

export default function App() {
  const [investments, dispatch] = useReducer(investmentsReducer, [] as InvestmentAny[]);
  const [timelineYears, setTimelineYears] = useState(1);
  const [income, setIncome] = useState('10000');
  const [inflation, setInflation] = useState('2.5');

  // --- derived slices ---
  const { loans, stocks, properties } = useMemo(() => {
    const loans = investments.filter(i => i instanceof Loan) as Loan[];
    const stocks = investments.filter(i => i instanceof Stock) as Stock[];
    const properties = investments.filter(i => i instanceof Property) as Property[];
    return { loans, stocks, properties };
  }, [investments]);

  // --- plan ---
  const plan: MonthlyPlan = useMemo(() => {
    const incomeNum = parseFloat(income) || 0;
    const inflationNum = (parseFloat(inflation) || 0) / 100;
    return calculateMonthlyPlan(
      incomeNum,
      loans,
      stocks,
      properties,
      timelineYears * 12,
      inflationNum
    );
  }, [income, inflation, loans, stocks, properties, timelineYears]);

  // --- handlers ---
  const handleAddInvestment = useCallback((newInv: InvestmentAny) => {
    dispatch({ type: 'add', payload: newInv } satisfies InvestmentAction);
  }, []);

  const handleInvestmentEdit = useCallback((id: string, field: string, value: string | number | boolean) => {
    dispatch({ type: 'update', id, field, value } satisfies InvestmentAction);
  }, []);

  const handleInvestmentRemove = useCallback((id: string) => {
    const investment = investments.find(x => x.id === id);
    if (!investment) return;

    const isUsedAsDownPaymentSource =
      investment instanceof Stock && loans.some(loan => loan.stockSourceId === id);

    let confirmMessage = `Are you sure you want to remove "${investment.name}"?`;
    if (isUsedAsDownPaymentSource) {
      const affected = loans.filter(l => l.stockSourceId === id).map(l => l.name).join('", "');
      confirmMessage = `Warning: This stock is used as a down payment source for: "${affected}".\n\n${confirmMessage}`;
    }
    if (!confirm(confirmMessage)) return;

    // reducer will also clean loan references if removing a stock
    dispatch({ type: 'remove', id } satisfies InvestmentAction);
  }, [investments, loans]);

  return (
    <div className="app-background">
      <Header />
      <main className="main-content">
        <InvestmentForm onAddInvestment={handleAddInvestment} stocks={stocks} />
        <SettingsPanel
          timelineYears={timelineYears}
          setTimelineYears={setTimelineYears}
          income={income}
          setIncome={setIncome}
          inflation={inflation}
          setInflation={setInflation}
        />
        <ChartSection
          plan={plan}
          investments={investments}
          timelineYears={timelineYears}
          properties={properties}
          stocks={stocks}
          loans={loans}
          expandedColors={expandedColors}
        />
        <InvestmentList
          investments={investments}
          handleInvestmentRemove={handleInvestmentRemove}
          handleInvestmentEdit={handleInvestmentEdit}
          plan={plan}
          stocks={stocks}
        />
      </main>
      <Footer />
    </div>
  );
}
