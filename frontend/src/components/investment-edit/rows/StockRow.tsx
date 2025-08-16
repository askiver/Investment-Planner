import type { Stock } from '@/models/models';
import InlineAuto from '@/components/forms/auto/InlineAuto';
import { stockSchema } from '@/components/forms/schemas';

export default function StockRow({
  inv, onEdit, onRemove,
}: { inv: Stock; onEdit: (field: string, value: string | number | boolean) => void; onRemove: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <b>Stock:</b>
        <button onClick={onRemove} className="remove-btn" title="Remove investment">&times;</button>
      </div>
      <InlineAuto schema={stockSchema} model={inv} onEdit={onEdit} />
    </>
  );
}
