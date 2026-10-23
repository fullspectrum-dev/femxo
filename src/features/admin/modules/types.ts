import type { ButtonVariant, ConfirmKind, StatusKey, TimelineStep } from "@/components/admin-ui";
import type { Cell, DatasetKey, RecordRow } from "../data/records";
import type { ModuleKey } from "../nav";

/** How a cell value is shown. Money cells hold paise. */
export type CellFormat = "text" | "inr" | "count" | "date" | "datetime" | "gst" | "units" | "status";

export interface ColumnSpec {
  key: string;
  header: string;
  format?: CellFormat;
  sortable?: boolean;
  /** The row's name: bold in the table, card title on phones. */
  primary?: boolean;
  /** A second field shown muted under this one (e.g. code under name). */
  sub?: string;
  hideOnMobile?: boolean;
}

export interface DetailSpec {
  label: string;
  key: string;
  format?: CellFormat;
}

export interface FormFieldSpec {
  name: string;
  label: string;
  kind: "text" | "email" | "tel" | "number" | "money" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  helper?: string;
  options?: readonly string[];
  pattern?: { regex: RegExp; message: string };
  /** For number and money fields (money in rupees). */
  min?: number;
  /** Upper-case as the user types (GSTIN, PAN, SKU). */
  uppercase?: boolean;
}

export type FormValues = Record<string, string>;

export interface CreateSpec {
  label: string;
  title: string;
  description: string;
  fields: readonly FormFieldSpec[];
  status: StatusKey;
  /** Rules across fields, e.g. dealer price ≤ MRP. Returns field → message. */
  validate?: (values: FormValues) => Partial<Record<string, string>>;
  toRow: (values: FormValues) => Record<string, Cell>;
  toast: (values: FormValues) => string;
}

export interface ActionSpec {
  key: string;
  label: string;
  /** States the action is allowed from (the server enforces the same). */
  from: readonly StatusKey[];
  /** Omitted for actions that don't change state (download, health check). */
  to?: StatusKey;
  variant: ButtonVariant;
  /** Financial and destructive actions name the amount and record first. */
  confirm?: {
    kind: ConfirmKind;
    title: string;
    description: string;
    amountKey?: string;
    confirmLabel: string;
  };
  toast: (row: RecordRow) => string;
  patch?: (row: RecordRow) => Record<string, Cell>;
}

export interface ViewSpec {
  key: string;
  label: string;
  dataset: DatasetKey;
  /** Singular noun for messages: "dealer". */
  entity: string;
  searchPlaceholder: string;
  searchKeys: readonly string[];
  columns: readonly ColumnSpec[];
  statuses: readonly StatusKey[];
  details: readonly DetailSpec[];
  recordName: (row: RecordRow) => string;
  subtitle?: (row: RecordRow) => string;
  timeline?: { label: string; steps: (row: RecordRow) => TimelineStep[] };
  /** A note shown in the detail drawer, e.g. the four-eyes rule. */
  note?: (row: RecordRow) => string | null;
  create?: CreateSpec;
  actions?: readonly ActionSpec[];
  /** Records here can't be changed from the panel (audit logs, ledgers). */
  readOnly?: boolean;
  empty: { title: string; message: string };
  pageSize?: number;
}

export interface ModuleSpec {
  key: Exclude<ModuleKey, "dashboard" | "company">;
  title: string;
  description: string;
  views: readonly ViewSpec[];
}
