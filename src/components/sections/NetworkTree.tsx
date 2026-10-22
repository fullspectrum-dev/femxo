"use client";

import { useEffect, useState } from "react";
import { EyeOff, Warehouse } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { BIHAR_LEVELS } from "@/lib/constants";
import { ROLES, ROLE_BY_ID, type RoleId } from "@/lib/roles";
import { cn } from "@/lib/utils";

/*
 * Mirrors the backend's access model (femxo-backend docs/permission-matrix.md
 * and ADR 0008): a role says what someone can do, a territory says where.
 * A user sees the territory they're assigned plus everything under it.
 *
 * Drawn as one path from the platform down to a customer, with a sibling or
 * two at some levels to show what stays out of sight.
 */

interface Sibling {
  name: string;
  note?: string;
  /** Warehouses sit beside the area tree: scoped by warehouse, not by area. */
  warehouse?: boolean;
}

interface Level {
  id: string;
  level: string;
  name: string;
  role?: RoleId;
  /** Sales groupings aren't government locations; drawn dashed. */
  grouping?: boolean;
  siblings?: Sibling[];
}

// The Raxaul side of Purbi Champaran, where Femxo is based.
const PATH: Level[] = [
  { id: "platform", level: "All states", name: "Femxo platform", role: "super-admin" },
  { id: "bihar", level: "State", name: "Bihar", role: "admin" },
  {
    id: "tirhut",
    level: "Division",
    name: "Tirhut",
    grouping: true,
    siblings: [{ name: "Patna Division" }, { name: "Warehouse", note: "serves districts", warehouse: true }],
  },
  { id: "district", level: "District", name: "Purbi Champaran", role: "dealer", siblings: [{ name: "Muzaffarpur" }] },
  { id: "subdivision", level: "Sub-division", name: "Raxaul", siblings: [{ name: "Motihari Sadar" }] },
  {
    id: "block",
    level: "Block",
    name: "Raxaul",
    role: "field-staff",
    siblings: [{ name: "Raxaul Nagar Parishad", note: "urban body" }],
  },
  { id: "panchayat", level: "Panchayat", name: "A panchayat" },
  { id: "village", level: "Village", name: "A village", role: "sub-dealer" },
  { id: "customer", level: "Customer", name: "Shop or home", role: "customer" },
];

const ROLE_EXAMPLES: Record<RoleId, string> = {
  "super-admin": "Every state, every record - as Femxo grows beyond Bihar.",
  admin: "Bihar - all 38 districts and everything inside them.",
  warehouse: "Their warehouse only. It can serve several districts, so it isn't tied to one area.",
  dealer: "Purbi Champaran and everything in it. Muzaffarpur stays hidden.",
  "field-staff": "Raxaul block - the beat they visit. The town's Nagar Parishad is someone else's.",
  "sub-dealer": "One village, allocated without overlap.",
  customer: "A shop or household - only their own orders.",
};

const TOTAL = PATH.length + PATH.reduce((sum, level) => sum + (level.siblings?.length ?? 0), 0);
const CYCLE_MS = 3800;

function scopeFor(roleId: RoleId) {
  const isWarehouse = roleId === "warehouse";
  // The warehouse role has no level on the path; nothing on it is visible.
  const anchor = isWarehouse ? PATH.length : PATH.findIndex((level) => level.role === roleId);
  const levelVisible = (i: number) => i >= anchor;
  // A sibling is visible when its parent (the level above) is.
  const siblingVisible = (i: number, sibling: Sibling) =>
    Boolean(sibling.warehouse && isWarehouse) || (i > 0 && levelVisible(i - 1));
  const visibleCount =
    PATH.filter((_, i) => levelVisible(i)).length +
    PATH.reduce((sum, level, i) => sum + (level.siblings?.filter((s) => siblingVisible(i, s)).length ?? 0), 0);
  return { anchor, levelVisible, siblingVisible, visibleCount };
}

export function NetworkTree() {
  const [roleId, setRoleId] = useState<RoleId>("dealer");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Walk through the roles until the visitor picks one themselves.
  useEffect(() => {
    if (!isAutoPlaying) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setRoleId((current) => {
        const index = ROLES.findIndex((role) => role.id === current);
        return ROLES[(index + 1) % ROLES.length].id;
      });
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying]);

  const selectRole = (id: RoleId) => {
    setIsAutoPlaying(false);
    setRoleId(id);
  };

  const role = ROLE_BY_ID[roleId];
  const RoleIcon = role.icon;
  const { anchor, levelVisible, siblingVisible, visibleCount } = scopeFor(roleId);

  return (
    <section
      id="network"
      className="ink band-ink relative scroll-mt-16 overflow-hidden py-16 sm:py-20"
      aria-labelledby="network-heading"
    >
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50" />

      <Container className="relative">
        {/* Heading, with the scale of Bihar beside it */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Territory and roles</p>
            <h2
              id="network-heading"
              className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              From the state to <span className="text-gold">every village</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Your role sets what you can do; your territory sets where. Everyone sees their area and
              everything under it - nothing beside it. Pick a role.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-3">
            {BIHAR_LEVELS.map((level) => (
              <div key={level.label} className="flex flex-col-reverse">
                <dt className="text-[11px] text-muted-foreground">{level.label}</dt>
                <dd className="font-display text-xl font-bold text-gold sm:text-2xl">{level.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Role picker */}
        <div
          role="tablist"
          aria-label="Roles"
          className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {ROLES.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === roleId}
              aria-controls="network-panel"
              onClick={() => selectRole(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                id === roleId
                  ? "border-gold-400 bg-gold-400 text-ink"
                  : "border-border bg-secondary/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={14} aria-hidden="true" />
              {name}
            </button>
          ))}
        </div>

        <div id="network-panel" role="tabpanel" className="card-glass mt-5 rounded-3xl p-4 sm:p-6">
          {/* The path: a rail on wide screens, a list on narrow ones */}
          <ol className="grid gap-2 lg:grid-cols-9 lg:gap-3" aria-label="From the platform down to a customer">
            {PATH.map((level, i) => {
              const visible = levelVisible(i);
              const isAnchor = i === anchor;
              const isAbove = i < anchor && anchor < PATH.length;
              const incomingLive = i > 0 && visible && !isAnchor;
              // The line on to the next level is live when that level is.
              const outgoingLive = i < PATH.length - 1 && levelVisible(i + 1) && i + 1 !== anchor;
              const levelRole = level.role ? ROLE_BY_ID[level.role] : null;

              return (
                <li key={level.id} className="relative flex gap-3 lg:flex-col lg:gap-2">
                  {/* Connector from the level above: vertical on phones, horizontal on desktop */}
                  {i > 0 && (
                    <>
                      <span
                        aria-hidden="true"
                        className={cn("dots-y absolute -top-2 left-[7px] h-[21px] w-0.5 lg:hidden", incomingLive && "is-live")}
                      />
                      <span
                        aria-hidden="true"
                        className={cn("dots-x absolute -left-3 top-[60px] hidden h-0.5 w-3 lg:block", incomingLive && "is-live")}
                      />
                    </>
                  )}
                  {i < PATH.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn("dots-y absolute bottom-0 left-[7px] top-[29px] w-0.5 lg:hidden", outgoingLive && "is-live")}
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative mt-[13px] size-4 shrink-0 rounded-full border-2 transition-colors duration-500 lg:hidden",
                      visible ? "border-gold-400 bg-gold-400" : "border-foreground/30 bg-background"
                    )}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="mb-2 hidden h-4 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:block">
                      {level.level}
                    </p>
                    <div
                      className={cn(
                        "flex min-h-[42px] items-center justify-between gap-2 rounded-xl border px-3 py-2 transition-all duration-500 lg:h-[72px] lg:flex-col lg:items-start lg:justify-center lg:gap-1",
                        level.grouping ? "border-dashed" : "border-solid",
                        isAnchor
                          ? "border-gold-400/80 bg-gold-400/10 shadow-[0_0_28px_-8px_rgba(255,198,92,0.6)]"
                          : visible
                            ? "border-gold-400/30 bg-secondary/70"
                            : isAbove
                              ? "border-foreground/15 bg-secondary/30 opacity-70"
                              : "border-foreground/10 opacity-40"
                      )}
                    >
                      <p className="min-w-0 truncate font-display text-sm font-semibold leading-tight text-foreground lg:line-clamp-2 lg:whitespace-normal">
                        <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:hidden">
                          {level.level}
                        </span>
                        {level.name}
                      </p>
                      {levelRole && (
                        <button
                          type="button"
                          onClick={() => selectRole(levelRole.id)}
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                            isAnchor ? "bg-gold-400 text-ink" : "text-highlight hover:bg-secondary"
                          )}
                          aria-label={`Show what a ${levelRole.name} can see`}
                        >
                          <levelRole.icon size={11} aria-hidden="true" />
                          <span className="max-w-[6.5rem] truncate">{levelRole.name}</span>
                        </button>
                      )}
                    </div>

                    {level.siblings && (
                      <ul className="mt-1.5 flex min-w-0 flex-wrap gap-1.5 lg:flex-col">
                        {level.siblings.map((sibling) => {
                          const shown = siblingVisible(i, sibling);
                          const isWarehouseAnchor = sibling.warehouse && roleId === "warehouse";
                          return (
                            <li
                              key={sibling.name}
                              title={sibling.note ? `${sibling.name} · ${sibling.note}` : sibling.name}
                              className={cn(
                                "flex min-w-0 max-w-full items-center gap-1 rounded-lg border border-dashed px-2 py-1 text-[11px] leading-tight transition-all duration-500",
                                isWarehouseAnchor
                                  ? "border-gold-400/80 bg-gold-400/10 text-foreground"
                                  : shown
                                    ? "border-gold-400/30 text-foreground"
                                    : "border-foreground/10 text-muted-foreground opacity-50"
                              )}
                            >
                              {sibling.warehouse ? (
                                <Warehouse size={11} aria-hidden="true" className="shrink-0 text-highlight" />
                              ) : (
                                !shown && <EyeOff size={11} aria-label="Hidden" className="shrink-0" />
                              )}
                              <span className="truncate">
                                {sibling.name}
                                {sibling.note && <span className="text-muted-foreground"> · {sibling.note}</span>}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The selected role, in one line */}
          <div
            aria-live="polite"
            className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-[auto_1fr_12rem] md:items-center md:gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="icon-tile-gold">
                <RoleIcon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight text-foreground">{role.name}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-highlight">
                  Territory: {role.scope}
                </p>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-relaxed text-foreground/90">{ROLE_EXAMPLES[roleId]}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {role.can.map((item) => (
                  <li key={item} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Visible here</span>
                <span className="font-semibold text-foreground">
                  {visibleCount} of {TOTAL}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gold-400 transition-[width] duration-500"
                  style={{ width: `${(visibleCount / TOTAL) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
