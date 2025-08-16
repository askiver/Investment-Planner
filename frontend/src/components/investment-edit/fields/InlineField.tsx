import React from 'react';

export default function InlineField({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="inline-field">
      <span className="inline-field__label">{label}</span>
      <span className="inline-field__control">{children}</span>
    </div>
  );
}
