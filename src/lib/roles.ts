import {
  BarChart3,
  Boxes,
  ClipboardList,
  Crown,
  FileClock,
  Landmark,
  Map as MapIcon,
  PackageSearch,
  Receipt,
  Repeat,
  Route,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/*
 * The roles agreed with the client (femxo-backend docs/permission-matrix.md),
 * widest reach first. Roles themselves live in the backend's database and are
 * edited by the Super Admin; this catalog only drives how the site presents
 * them. A role whose name doesn't match here gets the generic workspace.
 */

export type RoleId =
  | "super-admin"
  | "admin"
  | "warehouse"
  | "dealer"
  | "field-staff"
  | "sub-dealer"
  | "customer";

export interface RoleModule {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface RoleInfo {
  id: RoleId;
  name: string;
  icon: LucideIcon;
  /** Where the role's data reaches. */
  scope: string;
  /** What the role can do, in short. */
  can: readonly string[];
  /** Name of the workspace this role will get. */
  workspace: string;
  tagline: string;
  modules: readonly RoleModule[];
}

export const ROLES: readonly RoleInfo[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    icon: Crown,
    scope: "Everything",
    can: ["Create roles and permissions", "Assign territories to anyone", "All reports"],
    workspace: "Command Centre",
    tagline: "The whole network, every state, in one view.",
    modules: [
      { icon: ShieldCheck, title: "Roles and permissions", description: "Shape what every team can do" },
      { icon: MapIcon, title: "Territory map", description: "Assign states, districts and beats" },
      { icon: BarChart3, title: "Network reports", description: "Sales and growth across every state" },
      { icon: FileClock, title: "Audit trail", description: "Who changed what, and when" },
    ],
  },
  {
    id: "admin",
    name: "Admin",
    icon: Landmark,
    scope: "State",
    can: ["Manage products and orders", "Create users (never a Super Admin)", "Reports for the state"],
    workspace: "State Operations",
    tagline: "Products, orders and people across your state.",
    modules: [
      { icon: Boxes, title: "Products and pricing", description: "Dealer, sub-dealer and selling prices" },
      { icon: ClipboardList, title: "State-wide orders", description: "Every order from every district" },
      { icon: Users, title: "Dealers and staff", description: "Onboard people and set their areas" },
      { icon: BarChart3, title: "State reports", description: "District-by-district performance" },
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse Manager",
    icon: Warehouse,
    scope: "Own warehouse",
    can: ["Stock in and out", "Transfers, damage and returns", "Reports for own warehouse"],
    workspace: "Warehouse Desk",
    tagline: "Every box in, every box out - accounted for.",
    modules: [
      { icon: PackageSearch, title: "Stock in and out", description: "Receive and dispatch with batch tracking" },
      { icon: Repeat, title: "Transfers", description: "Move stock between warehouses" },
      { icon: Receipt, title: "Damage and returns", description: "Record write-offs and returns" },
      { icon: BarChart3, title: "Warehouse reports", description: "Stock levels and movement" },
    ],
  },
  {
    id: "dealer",
    name: "Dealer",
    icon: Truck,
    scope: "District",
    can: ["Order at dealer price", "Add sub-dealers", "Own orders and reports"],
    workspace: "Dealer Hub",
    tagline: "Grow your district, one sub-dealer at a time.",
    modules: [
      { icon: ShoppingCart, title: "Order at dealer price", description: "Restock in a few taps" },
      { icon: UserPlus, title: "Your sub-dealers", description: "Add them and see how they're doing" },
      { icon: ClipboardList, title: "Order tracking", description: "From placed to delivered" },
      { icon: BarChart3, title: "District reports", description: "Your sales across the district" },
    ],
  },
  {
    id: "field-staff",
    name: "Field staff",
    icon: Route,
    scope: "Assigned area",
    can: ["Take orders for customers", "View the product catalogue"],
    workspace: "Field App",
    tagline: "Your beat, your customers, your orders - on the move.",
    modules: [
      { icon: MapIcon, title: "Your beat", description: "The area and customers you cover" },
      { icon: ShoppingCart, title: "Order for a customer", description: "Book orders during a visit" },
      { icon: PackageSearch, title: "Product catalogue", description: "Prices and stock at a glance" },
      { icon: ClipboardList, title: "Today's orders", description: "What you booked, and its status" },
    ],
  },
  {
    id: "sub-dealer",
    name: "Sub-dealer",
    icon: Store,
    scope: "Village",
    can: ["Order at sub-dealer price", "Own orders and reports"],
    workspace: "Village Store",
    tagline: "Your village shop, connected to the whole network.",
    modules: [
      { icon: ShoppingCart, title: "Order at sub-dealer price", description: "Restock without the trip to town" },
      { icon: ClipboardList, title: "Your orders", description: "Track every delivery" },
      { icon: Receipt, title: "Bills and payments", description: "GST bills kept for you" },
      { icon: BarChart3, title: "Your sales", description: "What sells, and when" },
    ],
  },
  {
    id: "customer",
    name: "Customer",
    icon: ShoppingBag,
    scope: "Self",
    can: ["Shop at selling or Prime price", "Track own orders"],
    workspace: "Femxo Store",
    tagline: "Shop from local businesses you already trust.",
    modules: [
      { icon: ShoppingBag, title: "Shop products", description: "From sellers near you" },
      { icon: Crown, title: "Prime prices", description: "Member prices and offers" },
      { icon: ClipboardList, title: "Track orders", description: "Know when it arrives" },
      { icon: Receipt, title: "Your bills", description: "Every invoice in one place" },
    ],
  },
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map((role) => [role.id, role])) as Record<RoleId, RoleInfo>;

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

// Names an admin might reasonably give each role in the backend.
const NAME_MATCHES: [RoleId, string[]][] = [
  ["super-admin", ["superadmin"]],
  ["warehouse", ["warehousemanager", "warehouse"]],
  ["sub-dealer", ["subdealer"]],
  ["field-staff", ["fieldstaff", "fieldofficer", "salesofficer", "fieldexecutive"]],
  ["dealer", ["dealer", "distributor"]],
  ["admin", ["admin", "stateadmin"]],
  ["customer", ["customer"]],
];

/**
 * The role to present for a signed-in user: Super Admin if flagged, else the
 * widest known role they hold. Null when none of their roles is recognised.
 */
export function primaryRole(isSuperAdmin: boolean, roleNames: readonly string[]): RoleInfo | null {
  if (isSuperAdmin) return ROLE_BY_ID["super-admin"];
  const held = new Set(roleNames.map(normalise));
  const matches = NAME_MATCHES.filter(([, names]) => names.some((name) => held.has(name))).map(([id]) => id);
  return ROLES.find((role) => matches.includes(role.id)) ?? null;
}
