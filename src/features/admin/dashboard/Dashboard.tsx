"use client";

import { ArrowRight, ChevronRight, Download, ShoppingBag, Star, Store, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, ConfirmActionDialog, Segmented, StatCard, StatusBadge, useToast } from "@/components/admin-ui";
import type { StatDelta } from "@/components/admin-ui";
import { BarList, ChartCard, ColumnChart, LegendKey, StackedBar, TrendChart } from "@/components/admin-ui/viz";
import { cn } from "@/lib/utils";
import {
  ATTENTION,
  INVENTORY_HEALTH,
  OTHER_DISTRICTS,
  RANGES,
  RECENT_ACTIVITY,
  SPOTLIGHT,
  SYSTEM_HEALTH,
  dashboardFor,
} from "../data/dashboard";
import type { Kpi, RangeKey } from "../data/dashboard";
import { isAdminPrototype } from "../data/data-mode";
import { transitionRecord } from "../data/mock-api";
import {
  formatChange,
  formatCount,
  formatCountCompact,
  formatINR,
  formatINRCompact,
  formatINRTick,
  initials,
} from "../format";

const KPI_ICONS = { orders: ShoppingBag, aov: Wallet, partners: Store, prime: Star } as const;

const CHANNEL_COLORS = ["var(--fx-viz-cat-1)", "var(--fx-viz-cat-2)", "var(--fx-viz-cat-3)"] as const;
const INVENTORY_COLORS: Record<(typeof INVENTORY_HEALTH)[number]["key"], string> = {
  healthy: "var(--fx-viz-good)",
  low: "var(--fx-viz-warning)",
  expiring: "var(--fx-viz-serious)",
  out: "var(--fx-viz-critical)",
};

const TODAY = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

function kpiValue(kpi: Kpi) {
  return kpi.kind === "money" ? formatINR(kpi.value) : formatCount(kpi.value);
}

function kpiDelta(kpi: Kpi): StatDelta {
  const { kind, value } = kpi.change;
  return {
    text: kind === "percent" ? formatChange(value) : `+${formatCount(value)}`,
    direction: value > 0 ? "up" : value < 0 ? "down" : "flat",
    good: value >= 0,
  };
}

const perBucket = (range: RangeKey) => (range === "fy" ? "month" : range === "90d" ? "week" : "day");

export function Dashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
  const data = useMemo(() => dashboardFor(range), [range]);
  const { buckets, sales, previousSales, orders } = data.trend;
  const growth = data.sales.growth;
  const totalOrders = data.kpis[0]!.value;

  return (
    <div className="fx-dash">
      {/* Header + the one filter row that scopes everything below it */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-medium fx-muted">{TODAY.format(new Date())}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="fx-h1">Overview</h1>
            {isAdminPrototype ? <span className="fx-chip-proto fx-chip-proto--light">Prototype data</span> : null}
          </div>
          <p className="mt-1 text-[14px] fx-muted">Sales, partner network and operations across Bihar · all territories</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="Date range"
            items={RANGES.map((entry) => ({ key: entry.key, label: entry.label }))}
            value={range}
            onChange={setRange}
          />
          <Link href="/admin/reports?create=1" className="fx-btn fx-btn--secondary">
            <Download size={16} aria-hidden="true" />
            Export
          </Link>
        </div>
      </header>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <StatCard
            key={kpi.key}
            label={kpi.label}
            value={kpiValue(kpi)}
            delta={kpiDelta(kpi)}
            deltaSuffix={kpi.change.kind === "count" ? `new · ${data.range.label}` : data.range.compare}
            context={kpi.context}
            trend={kpi.trend}
            icon={KPI_ICONS[kpi.key]}
          />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Gross sales"
          description={data.range.long}
          actions={
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <LegendKey color="var(--fx-viz-accent)" label="This period" />
              <LegendKey color="var(--fx-viz-muted)" label="Previous period" />
            </span>
          }
          table={{
            columns: [
              { key: "period", label: "Period" },
              { key: "current", label: "This period", numeric: true },
              { key: "previous", label: "Previous period", numeric: true },
            ],
            rows: buckets.map((bucket, index) => ({
              period: bucket.full,
              current: formatINR(sales[index]!),
              previous: formatINR(previousSales[index]!),
            })),
          }}
        >
          <div className="mb-5 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="fx-hero-figure">{formatINRCompact(data.sales.total)}</p>
            <p className="flex flex-wrap items-center gap-2 pb-1.5 text-[13px]">
              <span className={cn("fx-delta", growth >= 0 ? "fx-delta--good" : "fx-delta--bad")}>{formatChange(growth)}</span>
              <span className="fx-muted">
                {data.range.compare} ({formatINRCompact(data.sales.previousTotal)})
              </span>
            </p>
          </div>
          <TrendChart
            labels={buckets}
            series={[
              { key: "previous", label: "Previous period", values: previousSales, tone: "muted" },
              { key: "current", label: "This period", values: sales, tone: "accent" },
            ]}
            formatValue={formatINR}
            formatTick={formatINRTick}
            height={300}
            label={`Gross sales, ${data.range.long}: ${formatINRCompact(data.sales.total)}, ${formatChange(growth)} ${data.range.compare}.`}
            tooltipFooter={(index) => {
              const before = previousSales[index]!;
              return before ? `${formatChange(sales[index]! / before - 1)} on the previous period` : null;
            }}
          />
        </ChartCard>

        <AttentionPanel />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard
          title="Orders"
          description={`Per ${perBucket(range)} · ${data.range.long.toLowerCase()}`}
          table={{
            columns: [
              { key: "period", label: "Period" },
              { key: "orders", label: "Orders", numeric: true },
            ],
            rows: buckets.map((bucket, index) => ({ period: bucket.full, orders: formatCount(orders[index]!) })),
          }}
        >
          <ColumnChart
            labels={buckets}
            values={orders}
            seriesLabel="Orders"
            formatValue={formatCount}
            formatTick={formatCountCompact}
            height={268}
            label={`Orders per ${perBucket(range)}, ${data.range.long}. The latest is ${formatCount(orders.at(-1)!)}.`}
          />
        </ChartCard>

        <ChartCard
          title="Top districts"
          description={`Gross sales · ${data.range.long.toLowerCase()}`}
          table={{
            columns: [
              { key: "district", label: "District" },
              { key: "sales", label: "Gross sales", numeric: true },
              { key: "share", label: "Share", numeric: true },
            ],
            rows: [
              ...data.districts.map((entry) => ({
                district: entry.label,
                sales: formatINR(entry.value),
                share: `${(entry.share * 100).toFixed(1)}%`,
              })),
              {
                district: `${OTHER_DISTRICTS} other districts`,
                sales: formatINR(data.otherDistricts),
                share: `${((data.otherDistricts / data.sales.total) * 100).toFixed(1)}%`,
              },
            ],
          }}
        >
          <BarList
            label="Gross sales by district"
            items={data.districts.map((entry) => ({ label: entry.label, value: entry.value, meta: `${(entry.share * 100).toFixed(1)}%` }))}
            formatValue={formatINRCompact}
          />
          <p className="mt-4 border-t border-[var(--fx-border)] pt-3 text-[12px] fx-muted">
            {OTHER_DISTRICTS} other districts · {formatINRCompact(data.otherDistricts)}
          </p>
        </ChartCard>

        <ChartCard
          className="md:col-span-2 xl:col-span-1"
          title="Orders by channel"
          description={`Share of ${formatCount(totalOrders)} orders`}
          table={{
            columns: [
              { key: "channel", label: "Channel" },
              { key: "orders", label: "Orders", numeric: true },
            ],
            rows: data.channels.map((channel) => ({ channel: channel.label, orders: formatCount(channel.value) })),
          }}
        >
          <StackedBar
            label="Orders by channel"
            parts={data.channels.map((channel, index) => ({ key: channel.key, label: channel.label, value: channel.value, color: CHANNEL_COLORS[index]! }))}
            formatValue={formatCount}
          />
          <p className="mt-4 text-[12px] leading-relaxed fx-muted">
            Partner orders are dealers and sub-dealers restocking; the customer app and field staff serve households directly.
          </p>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Top products"
          description={`By gross sales · ${data.range.long.toLowerCase()}`}
          actions={
            <Link href="/admin/products" className="fx-link">
              Catalogue <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        >
          <ol className="divide-y divide-[var(--fx-border)]">
            {data.products.map((product, index) => (
              <li key={product.sku} className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-x-3 py-3 first:pt-0 last:pb-0">
                <span className="text-[13px] font-semibold fx-muted fx-num">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{product.name}</p>
                  <p className="text-[12px] fx-muted">
                    {product.sku} · {formatCount(product.units)} units
                  </p>
                  <div className="fx-barlist-track mt-2 max-w-[360px]" aria-hidden="true">
                    <span className="fx-barlist-bar" style={{ width: `${(product.revenue / data.products[0]!.revenue) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold fx-num">{formatINRCompact(product.revenue)}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-[12px] font-semibold fx-num",
                      product.growth >= 0 ? "text-[var(--fx-success-text)]" : "text-[var(--fx-error-text)]"
                    )}
                  >
                    {formatChange(product.growth)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </ChartCard>

        <ChartCard
          title="Inventory health"
          description={`${formatCount(INVENTORY_HEALTH.reduce((sum, part) => sum + part.value, 0))} SKUs · 3 warehouses · now`}
          actions={
            <Link href="/admin/warehouse" className="fx-link">
              Stock <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        >
          <StackedBar
            label="SKUs by stock state"
            parts={INVENTORY_HEALTH.map((part) => ({ key: part.key, label: part.label, value: part.value, color: INVENTORY_COLORS[part.key] }))}
            formatValue={formatCount}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="System health" description="Integrations, background jobs and login protection">
          <ul className="-mx-2">
            {SYSTEM_HEALTH.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="fx-row-link px-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold">{item.label}</span>
                    <span className="block truncate text-[12px] fx-muted">{item.meta}</span>
                  </span>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard
          className="xl:col-span-2"
          title="Recent activity"
          description="Changes made in the panel, newest first"
          actions={
            <Link href="/admin/security" className="fx-link">
              Audit log <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        >
          <ol className="fx-activity">
            {RECENT_ACTIVITY.map((item) => (
              <li key={`${item.actor}-${item.target}`}>
                <span className="fx-avatar" aria-hidden="true">
                  {initials(item.actor)}
                </span>
                <p className="min-w-0 flex-1 text-[13.5px]">
                  <span className="font-semibold">{item.actor}</span> <span className="fx-muted">{item.action}</span>{" "}
                  <Link href={item.href} className="font-semibold hover:underline">
                    {item.target}
                  </Link>
                </p>
                <time className="flex-none text-[12px] fx-muted">{item.time}</time>
              </li>
            ))}
          </ol>
        </ChartCard>
      </div>
    </div>
  );
}

/** What needs a decision now: one featured application, then the queues. */
function AttentionPanel() {
  const toast = useToast();
  const [confirmReject, setConfirmReject] = useState(false);
  const [decided, setDecided] = useState(false);
  const waiting = ATTENTION.reduce((sum, item) => sum + item.count, 0);

  async function reject() {
    setConfirmReject(false);
    const { dataset, id, from } = SPOTLIGHT.record;
    try {
      await transitionRecord(dataset, id, from, "rejected");
      toast(`${SPOTLIGHT.title} rejected. Written to audit log.`);
    } catch {
      toast("This application changed meanwhile. Open Dealers to see its latest state.", "error");
    }
    // Either way it no longer needs a decision here.
    setDecided(true);
  }

  return (
    <ChartCard title="Needs attention" description={`${waiting} items waiting across ${ATTENTION.length} queues`} bodyClassName="flex flex-col gap-4">
      {decided ? null : (
        <div className="fx-spotlight">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{SPOTLIGHT.title}</p>
              <p className="mt-0.5 text-[12px] fx-muted">{SPOTLIGHT.meta}</p>
            </div>
            <StatusBadge status={SPOTLIGHT.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmReject(true)}>
              Reject
            </Button>
            <Link href={SPOTLIGHT.href} className="fx-btn fx-btn--primary fx-btn--sm">
              Review
            </Link>
          </div>
        </div>
      )}

      <ul className="-mx-2">
        {ATTENTION.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="fx-row-link px-2">
              <span className={cn("fx-tone-dot", `fx-tone-dot--${item.tone}`)} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold">{item.label}</span>
                <span className="block truncate text-[12px] fx-muted">{item.meta}</span>
              </span>
              <span className="fx-count-pill fx-num">{item.count}</span>
              <ChevronRight size={16} className="flex-none fx-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <ConfirmActionDialog
        open={confirmReject}
        kind="destructive"
        title="Reject dealer application"
        description="The partner must start a new application. This is written to the audit log."
        record={`${SPOTLIGHT.title} · ${SPOTLIGHT.meta}`}
        confirmLabel="Reject application"
        onClose={() => setConfirmReject(false)}
        onConfirm={() => void reject()}
      />
    </ChartCard>
  );
}
