import type { Property } from '@/models/models';
import InlineAuto from '@/components/forms/auto/InlineAuto';
import { propertySchema } from '@/components/forms/schemas';

export default function PropertyRow({
  inv, onEdit, onRemove,
}: { inv: Property; onEdit: (field: string, value: string | number | boolean) => void; onRemove: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <b>Property:</b>
        <button onClick={onRemove} className="remove-btn" title="Remove investment">&times;</button>
      </div>
      <InlineAuto schema={propertySchema} model={inv} onEdit={onEdit} />
    </>
  );
}
