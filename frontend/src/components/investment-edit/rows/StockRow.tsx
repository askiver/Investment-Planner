import type { Stock } from '@/models';
import { stockSpecs as S } from '@/components/forms/specs';
import InlineField from '../fields/InlineField';
import InlineText from '../fields/InlineText';
import InlineNumber from '../fields/InlineNumber';
import RateTypePicker from '@/components/investment-form/fields/RateTypePicker';

export default function StockRow({
  inv,
  onEdit,
  onRemove,
}: {
  inv: Stock;
  onEdit: (field: string, value: string | number | boolean) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <b>Stock:</b>
        <button onClick={onRemove} className="remove-btn" title="Remove investment">&times;</button>
      </div>

      <InlineField label={S.name.label}>
        <InlineText spec={S.name} value={inv.name} onChange={(raw) => onEdit('name', raw)} />
      </InlineField>

      <InlineField label={S.initialValue.label}>
        <InlineNumber spec={S.initialValue} value={inv.initialValue} onChange={(raw) => onEdit('initialValue', raw)} />
      </InlineField>

      <InlineField label={S.currentValue.label}>
        <InlineNumber spec={S.currentValue} value={inv.currentValue} onChange={(raw) => onEdit('currentValue', raw)} />
      </InlineField>

      <InlineField label={S.startMonths.label}>
        <InlineNumber spec={S.startMonths} value={inv.startMonths} onChange={(raw) => onEdit('startMonths', raw)} />
      </InlineField>

      <InlineField label={S.yearlyRatePct.label}>
        <InlineNumber spec={S.yearlyRatePct} value={inv.yearlyRate * 100} onChange={(raw) => onEdit('expectedReturn', raw)} />
      </InlineField>

      <InlineField label={S.taxRate.label}>
        <InlineNumber spec={S.taxRate} value={inv.taxRate * 100} onChange={(raw) => onEdit('taxRate', raw)} />
      </InlineField>

      <InlineField label="Rate type">
        <RateTypePicker
          idPrefix={`stock-${inv.id}`}
          value={inv.effectiveRate ? 'effective' : 'nominal'}
          onChange={(rt) => onEdit('rateType', rt)}
        />
      </InlineField>

      <input
        type="color"
        name="color"
        value={inv.color}
        onChange={(e) => onEdit('color', e.target.value)}
        style={{ marginLeft: 8, width: 40, height: 30, verticalAlign: 'middle' }}
        title="Edit color"
      />
    </>
  );
}
