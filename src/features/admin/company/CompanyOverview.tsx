"use client";

import { useState } from "react";
import { Button, Card, CardHeader, DataTable, PageHeader, StatusBadge, Toggle, useToast } from "@/components/admin-ui";
import type { Column } from "@/components/admin-ui";
import { SEED } from "../data/records";
import type { RecordRow } from "../data/records";
import { formatINR } from "../format";

// PROTOTYPE DATA: the company profile comes from GET /company once connected.
const PROFILE = [
  { label: "Legal name", value: "Femxo Consultancy Services Pvt. Ltd." },
  { label: "PAN", value: "AABCF••••F" },
  { label: "Registered address", value: "College Road, Near Kaudihar Chowk, Raxaul, Bihar 845305" },
  { label: "Financial year", value: "April – March" },
  { label: "Operating state", value: "Bihar" },
  { label: "Support contact", value: "support@demo.femxo.test" },
];

const GSTIN_COLUMNS: Column<RecordRow>[] = [
  { key: "gstin", header: "GSTIN", primary: true, render: (row) => String(row.gstin) },
  { key: "state", header: "State", render: (row) => String(row.state) },
  { key: "address", header: "Place of business", render: (row) => String(row.address) },
  { key: "primary", header: "Type", render: (row) => String(row.primary) },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

export function CompanyOverview() {
  const toast = useToast();
  const [eInvoice, setEInvoice] = useState(true);
  const [threshold] = useState(1_00_000_00);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <PageHeader title="Company Overview" description="Legal identity, GST registrations and the business rules every module follows." />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Company profile" description="Shown on invoices and partner agreements." />
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {PROFILE.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="fx-label">{item.label}</dt>
                <dd className="mt-1 break-words text-[14px] font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader title="Business rules" description="Changes apply to new records only and are written to the audit log." />
          <ul className="divide-y divide-[var(--fx-border)]">
            <li className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <span>
                <span className="block text-[14px] font-semibold">GST e-invoicing</span>
                <span className="block text-[12.5px] fx-muted">Generate an IRN for B2B invoices.</span>
              </span>
              <Toggle
                label="GST e-invoicing"
                checked={eInvoice}
                onChange={(value) => {
                  setEInvoice(value);
                  toast(`E-invoicing ${value ? "enabled" : "disabled"}. Written to audit log.`);
                }}
              />
            </li>
            <li className="flex items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-[14px] font-semibold">Super Admin approval above</span>
                <span className="block text-[12.5px] fx-muted">Settlements larger than this need a Super Admin.</span>
              </span>
              <span className="fx-num flex-none whitespace-nowrap text-[15px] font-bold">{formatINR(threshold)}</span>
            </li>
            <li className="flex items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-[14px] font-semibold">Expiry warning</span>
                <span className="block text-[12.5px] fx-muted">Batches are flagged this many days before expiry.</span>
              </span>
              <span className="fx-num flex-none whitespace-nowrap text-[15px] font-bold">30 days</span>
            </li>
            <li className="flex items-center justify-between gap-4 py-3 last:pb-0">
              <span>
                <span className="block text-[14px] font-semibold">GST rates in use</span>
                <span className="block text-[12.5px] fx-muted">Products can only use these rates.</span>
              </span>
              <span className="flex-none whitespace-nowrap text-[14px] font-semibold">0 · 5 · 18 · 40%</span>
            </li>
          </ul>
        </Card>
      </div>

      <section aria-labelledby="gstin-title" className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="gstin-title" className="fx-h2">
              GST registrations
            </h2>
            <p className="mt-1 text-[13px] fx-muted">Each GSTIN has its own invoice number series per financial year.</p>
          </div>
          <Button variant="secondary" onClick={() => toast("Adding a GSTIN needs the client's registration details (prototype).")}>
            Add GSTIN
          </Button>
        </div>
        <DataTable<RecordRow>
          label="GST registrations"
          columns={GSTIN_COLUMNS}
          rows={SEED.gstins}
          getRowId={(row) => row.id}
          state="ready"
          empty={null}
        />
      </section>
    </div>
  );
}
