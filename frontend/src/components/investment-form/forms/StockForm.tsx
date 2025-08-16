import type { Stock } from '@/models/models';
import AutoForm from '@/components/forms/auto/AutoForm';
import { stockSchema } from '@/components/forms/schemas';

export default function StockForm({ onSubmit }: { onSubmit: (s: Stock) => void }) {
  return <AutoForm schema={stockSchema} onSubmit={onSubmit} />;
}
