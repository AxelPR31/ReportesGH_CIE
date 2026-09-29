"use client";

type Props = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};

export function CS_MonthPicker({ year, month, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="cs-label min-w-[8rem] flex-1">
        Año
        <input
          type="number"
          className="cs-input"
          value={year}
          min={2000}
          max={2100}
          onChange={(e) => onChange(Number(e.target.value), month)}
        />
      </label>
      <label className="cs-label min-w-[8rem] flex-1">
        Mes
        <select
          className="cs-input"
          value={month}
          onChange={(e) => onChange(year, Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
