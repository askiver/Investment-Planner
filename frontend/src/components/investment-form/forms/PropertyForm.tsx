import type { Property } from '@/models/models';
import AutoForm from '@/components/forms/auto/AutoForm';
import { propertySchema } from '@/components/forms/schemas';

export default function PropertyForm({ onSubmit }: { onSubmit: (p: Property) => void }) {
  return <AutoForm schema={propertySchema} onSubmit={onSubmit} />;
}
