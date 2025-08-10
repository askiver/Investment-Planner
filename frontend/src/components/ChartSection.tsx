import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Loan, Property, Stock } from '@/models';
import type { MonthlyPlan } from '@/financeLogic';
import CustomTooltip from './CustomTooltip';
import { useMemo } from 'react';

/* ---------- Types ---------- */
type ChartRow = { month: number; Total: number } & Record<string, number>;

type Scenario = {
  rows: ChartRow[];
  assetKeys: string[]; // properties first, then stocks (only those that appear)
  loanKeys: string[];  // only loans that appear
  colorByName: Record<string, string>;
};

type ChartSectionProps = {
  plan: MonthlyPlan;
  investments: Array<Property | Stock | Loan>;
  timelineYears: number;
  properties: Property[];
  stocks: Stock[];
  loans: Loan[];
  expandedColors: string[];
};

/* ---------- Helpers ---------- */
const yearTick = (value: number) => Math.floor(value / 12).toString();
const moneyTick = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 0 });

const toNum = (x: unknown) =>
  typeof x === 'number' && Number.isFinite(x) ? x : 0;

/* Create a name->color map (prefer investment color, else palette) */
function makeColorByName(
  names: string[],
  allInvestments: Array<Property | Stock | Loan>,
  palette: string[],
): Record<string, string> {
  const colorOf = new Map(allInvestments.map(i => [i.name, i.color]));
  const map: Record<string, string> = {};
  names.forEach((name, i) => {
    map[name] = colorOf.get(name) || palette[i % palette.length];
  });
  return map;
}

/* ---------- Sub-component: one chart panel ---------- */
function ChartPanel({
  title,
  scenario,
  plan,
  stocks,
}: {
  title: string;
  scenario: Scenario;
  plan: MonthlyPlan;
  stocks: Stock[];
}) {
  const { rows, assetKeys, loanKeys, colorByName } = scenario;

  return (
    <>
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={rows} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tickFormatter={yearTick}
            interval={11}
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis width={90} tickFormatter={moneyTick} />
          <Tooltip content={p => <CustomTooltip {...p} plan={plan} stocks={stocks} />} />
          <Legend />

          {/* Loans below x-axis */}
          {loanKeys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="loans"
              stroke={colorByName[key]}
              fill={colorByName[key]}
              isAnimationActive={false}
              name={key}
            />
          ))}

          {/* Assets (properties then stocks) */}
          {assetKeys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="assets"
              stroke={colorByName[key]}
              fill={colorByName[key]}
              isAnimationActive={false}
              name={key}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}

/* ---------- Main component ---------- */
export default function ChartSection({
  plan,
  investments,
  timelineYears,
  properties,
  stocks,
  loans,
  expandedColors,
}: ChartSectionProps) {
  const propertyNames = useMemo(() => new Set(properties.map(p => p.name)), [properties]);
  const stockNames    = useMemo(() => new Set(stocks.map(s => s.name)), [stocks]);
  const loanNames     = useMemo(() => new Set(loans.map(l => l.name)), [loans]);

  const buildScenario = (useTaxed: boolean): Scenario => {
    const rows: ChartRow[] = [];
    const usedProps = new Set<string>();
    const usedStocks = new Set<string>();
    const usedLoans = new Set<string>();
    const maxMonths = timelineYears * 12 + 1;

    for (let m = 0; m <= maxMonths; m++) {
      const entry: ChartRow = { month: m, Total: 0 };

      // Properties
      for (const p of plan.propertyInvestments) {
        const name = p.asset.name;
        if (!propertyNames.has(name)) continue;
        const val = useTaxed ? p.taxedValues[m] : p.totalValues[m];
        if (toNum(val) > 0) {
          entry[name] = val as number;
          usedProps.add(name);
        }
      }

      // Stocks
      for (const s of plan.stockInvestments) {
        const name = s.asset.name;
        if (!stockNames.has(name)) continue;
        const val = useTaxed ? s.taxedValues[m] : s.totalValues[m];
        if (toNum(val) > 0) {
          entry[name] = val as number;
          usedStocks.add(name);
        }
      }

      // Loans (negative for stacking below x-axis)
      for (const l of plan.loans) {
        const name = l.loan.name;
        if (!loanNames.has(name)) continue;
        const principal = toNum(l.principals[m]);
        if (m >= l.loan.startMonths && principal >= 0) {
          entry[name] = -principal;
          usedLoans.add(name);
        }
      }

      // Total
      const precomputed = useTaxed ? plan.netWorthTaxed?.[m] : plan.netWorth?.[m];
      entry.Total =
        typeof precomputed === 'number' && Number.isFinite(precomputed)
          ? precomputed
          : Object.entries(entry)
              .filter(([k]) => k !== 'month')
              .reduce((s, [, v]) => s + (typeof v === 'number' ? v : 0), 0);

      rows.push(entry);
    }

    // Keys in the intended order, but only those that appear
    const propsOrdered = plan.propertyInvestments
      .map(p => p.asset.name)
      .filter(n => usedProps.has(n));

    const stocksOrdered = plan.stockInvestments
      .map(s => s.asset.name)
      .filter(n => usedStocks.has(n));

    const loansOrdered = plan.loans
      .map(l => l.loan.name)
      .filter(n => usedLoans.has(n));

    const assetKeys = [...propsOrdered, ...stocksOrdered];
    const allSeries = [...assetKeys, ...loansOrdered];
    const colorByName = makeColorByName(allSeries, investments, expandedColors);

    return { rows, assetKeys, loanKeys: loansOrdered, colorByName };
  };

  const noTax = useMemo(() => buildScenario(false), [
    plan,
    timelineYears,
    propertyNames,
    stockNames,
    loanNames,
    investments,
    expandedColors,
  ]);

  const withTax = useMemo(() => buildScenario(true), [
    plan,
    timelineYears,
    propertyNames,
    stockNames,
    loanNames,
    investments,
    expandedColors,
  ]);

  return (
    <section className="card chart-section">
      <ChartPanel title="Portfolio Value Over Time (No Tax)" scenario={noTax} plan={plan} stocks={stocks} />
      <ChartPanel title="Portfolio Value Over Time (With Tax)" scenario={withTax} plan={plan} stocks={stocks} />
    </section>
  );
}
