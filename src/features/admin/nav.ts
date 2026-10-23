import {
  Activity,
  Bell,
  Building,
  ChartColumn,
  CreditCard,
  LayoutGrid,
  Lock,
  MapPin,
  Package,
  Plug,
  ReceiptText,
  Shield,
  Star,
  Store,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** The 17 admin modules, in sidebar order. */
export type ModuleKey =
  | "dashboard"
  | "company"
  | "users"
  | "roles"
  | "security"
  | "products"
  | "dealers"
  | "sub-dealers"
  | "warehouse"
  | "prime"
  | "customers"
  | "orders"
  | "billing"
  | "finance"
  | "reports"
  | "notifications"
  | "integrations";

export interface NavItem {
  key: ModuleKey;
  label: string;
  href: `/admin/${string}`;
  icon: LucideIcon;
  /**
   * The permission that shows this item. The sidebar hides items the user
   * lacks (Foundations "Hidden nav items"); the API still enforces access.
   */
  permission: string;
  /** Items waiting for action, shown as the gold count. */
  badge?: number;
}

export interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

const item = (key: ModuleKey, label: string, icon: LucideIcon, permission: string, badge?: number): NavItem => ({
  key,
  label,
  href: `/admin/${key}`,
  icon,
  permission,
  badge,
});

// Sidebar groups and counts as on the dashboard canvas.
export const NAV_GROUPS: readonly NavGroup[] = [
  { label: "Overview", items: [item("dashboard", "Dashboard", LayoutGrid, "dashboard.view")] },
  {
    label: "Organization & Access",
    items: [
      item("company", "Company Overview", Building, "company.view"),
      item("users", "User Management", UserRound, "user.view"),
      item("roles", "Roles & Permissions", Lock, "role.view"),
      item("security", "Security & Audit Logs", Shield, "audit.view"),
    ],
  },
  {
    label: "Commerce & Network",
    items: [
      item("products", "Products & Catalog", Package, "product.view"),
      item("dealers", "Dealers", Store, "dealer.view", 7),
      item("sub-dealers", "Sub-Dealers", MapPin, "subdealer.view", 12),
      item("warehouse", "Warehouse & Inventory", Warehouse, "inventory.view", 5),
      item("prime", "Prime Membership", Star, "prime.view"),
      item("customers", "Customers", UserRound, "customer.view"),
    ],
  },
  {
    label: "Operations & Finance",
    items: [
      item("orders", "Orders & Delivery", Truck, "order.view"),
      item("billing", "Billing & Invoices", ReceiptText, "invoice.view", 4),
      item("finance", "Finance & Wallet", CreditCard, "wallet.view"),
    ],
  },
  {
    label: "Insights & Integrations",
    items: [
      item("reports", "Reports & Analytics", ChartColumn, "report.view"),
      item("notifications", "Notifications", Bell, "notification.view", 3),
      item("integrations", "API & Integrations", Plug, "integration.view", 2),
    ],
  },
];

export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/** The nav item and its group for a path, for breadcrumbs and the active link. */
export function findNav(pathname: string) {
  for (const group of NAV_GROUPS) {
    const match = group.items.find((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`));
    if (match) return { group, item: match };
  }
  return null;
}

/** Mobile bottom navigation (Mobile 390 canvas): Home, Orders, Finance, More. */
export const BOTTOM_NAV = [
  { label: "Home", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Orders", href: "/admin/orders", icon: Truck },
  { label: "Finance", href: "/admin/finance", icon: CreditCard },
] as const;

export const MORE_ICON = Activity;
