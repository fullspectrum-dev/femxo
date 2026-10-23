/**
 * A 12-point trend for a stat tile: the history in the quiet hue, the latest
 * step and end dot in the accent. Decorative (the tile states the numbers).
 */
export function Sparkline({ values, height = 36 }: { values: readonly number[]; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  // Drawn in a 100-unit box and stretched; strokes don't scale (non-scaling-stroke).
  const point = (value: number, index: number) => [(index / (values.length - 1)) * 100, 4 + (1 - (value - min) / span) * 28] as const;
  const points = values.map(point);
  const line = (list: readonly (readonly [number, number])[]) => list.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join("");
  const end = points.at(-1)!;

  return (
    <div className="relative" style={{ height }} aria-hidden="true">
      <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path d={`${line(points)}L100,36L0,36Z`} className="fx-spark-wash" />
        <path d={line(points.slice(0, -1))} className="fx-spark-line" vectorEffect="non-scaling-stroke" />
        <path d={line(points.slice(-2))} className="fx-spark-line fx-spark-line--accent" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* A real circle would stretch with the box, so the end dot is HTML. */}
      <span className="fx-spark-dot" style={{ left: `${end[0]}%`, top: `${(end[1] / 36) * 100}%` }} />
    </div>
  );
}
