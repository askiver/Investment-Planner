import type { Loan, Stock } from '@/models/models';
import AutoForm from '@/components/forms/auto/AutoForm';
import { loanSchema } from '@/components/forms/schemas';

export default function LoanForm({ onSubmit, stocks }: { onSubmit: (l: Loan) => void; stocks: Stock[] }) {
  return <AutoForm schema={loanSchema} onSubmit={onSubmit} context={{ stocks }} />;
}
