// components/CustomTooltip.tsx
import React from 'react';
import type { TooltipProps } from 'recharts';
import type { MonthlyPlan } from '@/financeLogic';
import type { Scenario } from './ChartSection';

type Props = TooltipProps<number, string> & {
  scenario: Scenario;
  plan: MonthlyPlan;
  moneyFmt?: (n: number) => string;
};

const defaultMoneyFmt = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 0 });

const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : 0);

const splitMonthYear = (index: number) => ({
  years: Math.floor(index / 12),
  months: index % 12,
});

const ColorDot = ({ color }: { color: string }) => (
  <span
    style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: color,
      marginRight: 8,
      verticalAlign: 'middle',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.25)',
    }}
  />
);

export default function CustomTooltip({
  active,
  payload,
  label,
  scenario,
  plan,
  moneyFmt = defaultMoneyFmt,
}: Props) {
  if (!active || !payload || payload.length === 0) return null;

  const dp = (payload[0] as any)?.payload as Record<string, unknown>;
  const monthIndex = typeof label === 'number' ? label : num(dp?.month);
  const { years, months } = splitMonthYear(monthIndex);

  const propertyNames = new Set(plan.propertyInvestments?.map(p => p.asset.name) ?? []);
  const stockNames    = new Set(plan.stockInvestments?.map(s => s.asset.name) ?? []);
  const loanNames     = new Set(plan.loans?.map(l => l.loan.name) ?? []);

  const colorByName: Record<string, string> = {};
  for (const item of payload as any[]) {
    if (!item || !item.name) continue;
    colorByName[item.name] = item.color || item.payload?.stroke || item.payload?.fill || '#888';
  }

  const properties = scenario.assetKeys
    .filter(n => propertyNames.has(n))
    .map(name => ({ name, value: num(dp[name]), color: colorByName[name] }))
    .filter(x => x.value !== 0);

  const stocks = scenario.assetKeys
    .filter(n => stockNames.has(n))
    .map(name => {
      const value = num(dp[name]);
      const s = plan.stockInvestments?.find(x => x.asset.name === name);
      const investable = num(s?.investedValues?.[monthIndex]);
      return { name, value, investable, color: colorByName[name] };
    })
    .filter(x => x.value !== 0 || x.investable !== 0);

  const loans = scenario.loanKeys
    .filter(n => loanNames.has(n))
    .map(name => {
      const l = plan.loans?.find(x => x.loan.name === name);

      // Remaining principal (balance)
      const principalBal = num(l?.principals?.[monthIndex]);

      // Interest payment this month
      const interestPay = num((l as any)?.ratePayments?.[monthIndex]);

      // Principal payment this month:
      const principalPay =
        num((l as any)?.principalPayments?.[monthIndex]);

      return { name, principalBal, principalPay, interestPay, color: colorByName[name] };
    })
    .filter(x => x.principalBal !== 0 || x.principalPay !== 0 || x.interestPay !== 0);

  const totalValue  = num(dp.Total);
  const wealthValue =
    num((plan as any).wealth?.[monthIndex]) ||
    num((plan as any).netWorthTaxed?.[monthIndex]) ||
    num((plan as any).netWorth?.[monthIndex]) ||
    totalValue;
  const wealthTaxPaid = num((plan as any).wealthTax?.[monthIndex]);

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontWeight: 600, marginTop: 10, marginBottom: 6, color: '#cbd5e1' }}>
      {children}
    </div>
  );

  const Row = ({
    color,
    name,
    right,
    style,
  }: {
    color?: string;
    name: string;
    right: string;
    style?: React.CSSProperties;
  }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        lineHeight: 1.4,
        color: '#e5e7eb',
        ...style,
      }}
    >
      {color && <ColorDot color={color} />}
      <div style={{ flex: 1 }}>{name}</div>
      <div style={{ whiteSpace: 'nowrap' }}>{right}</div>
    </div>
  );

  return (
    <div
      className="custom-tooltip"
      style={{
        background: 'rgba(2,6,23,0.96)',
        color: '#e5e7eb',
        border: '1px solid rgba(148,163,184,0.25)',
        borderRadius: 8,
        padding: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        maxWidth: 420,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>
        {`Year ${years} • Month ${months}`}
      </div>

      {/* Properties */}
      {properties.length > 0 && <SectionTitle>Properties</SectionTitle>}
      {properties.map(p => (
        <Row key={p.name} color={p.color} name={p.name} right={moneyFmt(p.value)} />
      ))}

      {/* Stocks */}
      {stocks.length > 0 && <SectionTitle>Stocks</SectionTitle>}
      {stocks.map(s => (
        <Row
          key={s.name}
          color={s.color}
          name={s.name}
          right={`${moneyFmt(s.value)}  •  investable ${moneyFmt(s.investable)}`}
        />
      ))}

      {/* Loans */}
      {loans.length > 0 && <SectionTitle>Loans</SectionTitle>}
      {loans.map(l => (
        <Row
          key={l.name}
          color={l.color}
          name={l.name}
          right={
            `balance ${moneyFmt(l.principalBal)}  •  ` +
            `principal ${moneyFmt(l.principalPay)}  •  ` +
            `interest ${moneyFmt(l.interestPay)}`
          }
        />
      ))}

      {/* Divider */}
      <div style={{ margin: '10px 0', borderTop: '1px solid rgba(148,163,184,0.2)' }} />

      {/* Totals */}
      <SectionTitle>Totals</SectionTitle>
      <Row name="Total value" right={moneyFmt(totalValue)} style={{ color: '#f8fafc' }} />
      <Row name="Wealth value" right={moneyFmt(wealthValue)} style={{ color: '#f8fafc' }} />
      <Row name="Wealth tax (this month)" right={moneyFmt(wealthTaxPaid)} style={{ color: '#f8fafc' }} />
    </div>
  );
}
