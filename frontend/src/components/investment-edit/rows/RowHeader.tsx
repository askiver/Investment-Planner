// src/components/investment-edit/rows/RowHeader.tsx
export default function RowHeader({
  title,
  onRemove,
}: { title: string; onRemove: () => void }) {
  return (
    <div className="investment-row__head">
      <span className="investment-row__title">{title}</span>
      <button onClick={onRemove} className="remove-btn" aria-label="Remove investment" title="Remove investment">
        &times;
      </button>
    </div>
  );
}
