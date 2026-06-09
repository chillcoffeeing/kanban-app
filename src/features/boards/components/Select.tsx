interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-neutral-light bg-surface px-3 py-1.5 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
