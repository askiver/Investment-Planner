// src/components/CustomTooltip.tsx
import type { TooltipProps } from 'recharts';
import type { MonthlyPlan } from '../financeLogic';
import type { Stock } from '../models';
import type {NameType, ValueType} from "recharts/types/component/DefaultTooltipContent";

type ExtraProps = {
  plan: MonthlyPlan;
  stocks: Stock[];
};

const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 2 });

// Normalize to number (0 if missing/NaN)
const toNum = (x: unknown) =>
  typeof x === 'number' && Number.isFinite(x) ? x : 0;

export default function CustomTooltip(
  props: TooltipProps<ValueType, NameType> & ExtraProps
) {
  const { active, label, payload = [], plan } = props;
  if (!active) return null;

  const month = Number(label);
  if (!Number.isFinite(month)) return null;

  const row = (payload[0]?.payload) as
    | Record<string, unknown>
    | undefined;
  if (!row) return null;

  // Prefer precomputed Total, else sum all numeric fields except 'month'
  const total =
    typeof row.Total === 'number'
      ? (row.Total as number)
      : Object.entries(row)
          .filter(([k]) => k !== 'month')
          .reduce((s, [, v]) => s + toNum(v), 0);

  // O(1) lookups
  const loanByName = new Map((plan.loans ?? []).map((l) => [l.loan.name, l]));
  const stockPlanByName = new Map(
    (plan.stockInvestments ?? []).map((s) => [s.asset.name, s])
  );
  const stockByName = new Map((plan.stockInvestments ?? []).map((s) => [s.asset.name, s]));
  const sellOffById = plan.stockSellOffs ?? {};

  // Build items to render: Total first (synthetic), then each series from payload
  const items = [
    { _kind: 'total' as const, key: '__total', label: 'Total', color: '#222', value: total },
    ...(payload ?? []).map((p, i) => ({
      _kind: 'series' as const,
      key: String(p.dataKey ?? i),
      // p.name is the friendly label ("Property: X"); p.dataKey is the base key ("X")
      label: String(p.name ?? p.dataKey ?? ''),
      base: String(p.dataKey ?? p.name ?? ''),
      color: p.color ?? '#000',
      value: toNum(p.value),
    })),
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        Year {Math.floor(month / 12)} · Month {month % 12}
      </div>

      {items.map((it) => {
        if (it._kind === 'total') {
          return (
            <div
              key={it.key}
              style={{
                color: it.color,
                fontWeight: 700,
                borderBottom: '1px solid #ccc',
                paddingBottom: 4,
                marginBottom: 6,
              }}
            >
              Total: {fmt(it.value)}
            </div>
          );
        }

        // Series row (asset/loan)
        const loan = loanByName.get(it.base);
        const stockPlan = stockPlanByName.get(it.base);
        const stockMeta = stockByName.get(it.base);
        const sellOff = stockMeta?.asset.id ? toNum(sellOffById[stockMeta.asset.id]?.[month]) : 0;

        return (
          <div key={it.key} style={{ color: it.color }}>
            <div>
              {it.label}: {fmt(Math.abs(it.value))}
            </div>

            {/* Loan payment breakdown */}
            {loan?.principalPayments?.[month] != null && (
              <div style={{ marginLeft: 12, fontSize: '0.85em' }}>
                <div>Principal: {fmt(loan.principalPayments[month] || 0)}</div>
                <div>Interest: {fmt(loan.ratePayments?.[month] || 0)}</div>
              </div>
            )}

            {/* Stock monthly contribution + sell-offs */}
            {stockPlan && (
              <div style={{ marginLeft: 12, fontSize: '0.85em' }}>
                {stockPlan.investedValues?.[month] != null && (
                  <div>Monthly Investment: {fmt(stockPlan.investedValues[month] || 0)}</div>
                )}
                {sellOff > 0 && <div>Sold this month: {fmt(sellOff)}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
