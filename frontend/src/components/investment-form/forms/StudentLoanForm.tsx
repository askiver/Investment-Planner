import type { StudentLoan } from '@/models/models';
import AutoForm from '@/components/forms/auto/AutoForm';
import { studentLoanSchema } from '@/components/forms/schemas';

export default function StudentLoanForm({ onSubmit }: { onSubmit: (l: StudentLoan) => void }) {
  return <AutoForm schema={studentLoanSchema} onSubmit={onSubmit} />;
}
