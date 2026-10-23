/**
 * Ranked horizontal bars, one series in one colour, value at the tip. For
 * "compare magnitude" with long category names (districts, products).
 */
export function BarList({
  items,
  formatValue,
  label,
}: {
  items: readonly { label: string; value: number; meta?: string }[];
  formatValue: (value: number) => string;
  label: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ol className="grid gap-3.5" aria-label={label}>
      {items.map((item) => (
        <li key={item.label} className="fx-barlist-row">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate font-medium">{item.label}</span>
            <span className="flex-none">
              <span className="font-semibold fx-num">{formatValue(item.value)}</span>
              {item.meta ? <span className="ml-1.5 text-[12px] fx-muted fx-num">{item.meta}</span> : null}
            </span>
          </div>
          <div className="fx-barlist-track mt-1.5" aria-hidden="true">
            <span className="fx-barlist-bar" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
