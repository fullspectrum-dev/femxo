import type { StatusKey } from "@/components/admin-ui";

/*
 * PROTOTYPE DATA for every module list. Names are illustrative, emails use
 * the demo.femxo.test domain, phone numbers and GSTINs are masked or fake,
 * and money is in paise. Replaced by API responses once femxo-backend's
 * admin routes exist (see mock-api.ts).
 */

export type Cell = string | number | null;

export interface RecordRow {
  id: string;
  status: StatusKey;
  [field: string]: Cell;
}

export type DatasetKey =
  | "users"
  | "roles"
  | "securityEvents"
  | "auditLog"
  | "products"
  | "dealers"
  | "subDealers"
  | "stock"
  | "transfers"
  | "adjustments"
  | "primeSubscriptions"
  | "primePlans"
  | "customers"
  | "orders"
  | "invoices"
  | "settlements"
  | "wallets"
  | "reports"
  | "deliveries"
  | "templates"
  | "integrations"
  | "deadLetters"
  | "gstins";

type SeedRow = { status: StatusKey } & Record<string, Cell>;

const rows = (prefix: string, list: SeedRow[]): RecordRow[] =>
  list.map((row, index) => ({ ...row, id: `${prefix}-${index + 1}` }));

export const SEED: Record<DatasetKey, RecordRow[]> = {
  users: rows("usr", [
    { name: "Munni S.", email: "munni.s@demo.femxo.test", role: "Super Admin", scope: "All territories", lastLogin: "2026-10-23T09:58:00+05:30", status: "active" },
    { name: "Rakesh Kumar", email: "rakesh.k@demo.femxo.test", role: "Admin", scope: "Bihar", lastLogin: "2026-10-23T08:40:00+05:30", status: "active" },
    { name: "Priya Sinha", email: "priya.s@demo.femxo.test", role: "Finance Admin", scope: "Bihar", lastLogin: "2026-10-22T18:12:00+05:30", status: "active" },
    { name: "Amit Raj", email: "amit.r@demo.femxo.test", role: "Compliance", scope: "Bihar", lastLogin: "2026-10-23T10:42:00+05:30", status: "active" },
    { name: "Sunil Yadav", email: "sunil.y@demo.femxo.test", role: "Warehouse Manager", scope: "Patna WH", lastLogin: "2026-10-23T09:15:00+05:30", status: "active" },
    { name: "Neha Kumari", email: "neha.k@demo.femxo.test", role: "Field staff", scope: "Patna West", lastLogin: "2026-10-21T16:05:00+05:30", status: "active" },
    { name: "Vikash Anand", email: "vikash.a@demo.femxo.test", role: "Dealer", scope: "Patna district", lastLogin: "2026-10-22T11:30:00+05:30", status: "active" },
    { name: "Ravi Prakash", email: "ravi.p@demo.femxo.test", role: "Field staff", scope: "Gaya Town", lastLogin: "2026-09-30T12:00:00+05:30", status: "disabled" },
  ]),

  roles: rows("role", [
    { name: "Super Admin", kind: "System", users: 2, permissions: 64, scope: "Everything", status: "active" },
    { name: "Admin", kind: "System", users: 6, permissions: 48, scope: "State", status: "active" },
    { name: "Finance Admin", kind: "Custom", users: 3, permissions: 14, scope: "State", status: "active" },
    { name: "Compliance", kind: "Custom", users: 2, permissions: 11, scope: "State", status: "active" },
    { name: "Warehouse Manager", kind: "System", users: 9, permissions: 12, scope: "Warehouse", status: "active" },
    { name: "Dealer", kind: "System", users: 612, permissions: 9, scope: "District", status: "active" },
    { name: "Sub-dealer", kind: "System", users: 3940, permissions: 5, scope: "Village", status: "active" },
    { name: "Field staff", kind: "System", users: 148, permissions: 6, scope: "Assigned area", status: "active" },
  ]),

  securityEvents: rows("sec", [
    { event: "5 failed logins · admin@…", actor: "Unknown", ip: "103.xx.xx.12", at: "2026-10-23T10:31:00+05:30", status: "blocked" },
    { event: "Role changed · Finance Admin", actor: "Munni S.", ip: "49.xx.xx.201", at: "2026-10-23T09:02:00+05:30", status: "logged" },
    { event: "Session revoked · Ravi Prakash", actor: "Rakesh Kumar", ip: "49.xx.xx.88", at: "2026-10-22T17:44:00+05:30", status: "logged" },
    { event: "Integration secret rotated · SMS", actor: "Munni S.", ip: "49.xx.xx.201", at: "2026-10-22T12:10:00+05:30", status: "logged" },
    { event: "Permission denied · settlement.release", actor: "Neha Kumari", ip: "157.xx.xx.4", at: "2026-10-22T11:05:00+05:30", status: "blocked" },
    { event: "Super Admin override · role change", actor: "Munni S.", ip: "49.xx.xx.201", at: "2026-10-21T15:20:00+05:30", status: "logged" },
    { event: "IP rate-limited · login", actor: "Unknown", ip: "185.xx.xx.77", at: "2026-10-21T02:14:00+05:30", status: "blocked" },
  ]),

  auditLog: rows("aud", [
    { action: "dealer.approve", actor: "Amit Raj", entity: "Anand Agencies (DL-0001)", at: "2026-10-23T10:42:00+05:30", status: "logged" },
    { action: "inventory.transfer_dispatch", actor: "Sunil Yadav", entity: "TR-1042", at: "2026-10-23T09:15:00+05:30", status: "logged" },
    { action: "role.assign", actor: "Munni S.", entity: "Priya Sinha → Finance Admin", at: "2026-10-23T09:02:00+05:30", status: "logged" },
    { action: "settlement.create", actor: "Priya Sinha", entity: "ST-2210", at: "2026-10-22T18:30:00+05:30", status: "logged" },
    { action: "product.price_manage", actor: "Rakesh Kumar", entity: "Edible oil 1 L (FX-OIL-1L)", at: "2026-10-22T14:12:00+05:30", status: "logged" },
    { action: "user.manage", actor: "Rakesh Kumar", entity: "Ravi Prakash (disabled)", at: "2026-10-22T17:43:00+05:30", status: "logged" },
  ]),

  products: rows("prd", [
    { name: "Staples bundle 5 kg", sku: "FX-STP-5KG", brand: "Femxo Select", category: "Staples", mrp: 64900, dealerPrice: 55200, gst: 500, status: "active" },
    { name: "Edible oil 1 L", sku: "FX-OIL-1L", brand: "Femxo Select", category: "Edible oil", mrp: 18500, dealerPrice: 16100, gst: 500, status: "active" },
    { name: "Personal care kit", sku: "FX-PCK-STD", brand: "Femxo Daily", category: "Personal care", mrp: 34900, dealerPrice: 28800, gst: 1800, status: "active" },
    { name: "Rice 25 kg", sku: "FX-RICE-25", brand: "Femxo Select", category: "Staples", mrp: 149000, dealerPrice: 131500, gst: 500, status: "active" },
    { name: "Biscuit pack (12)", sku: "FX-BIS-12", brand: "Femxo Daily", category: "Snacks", mrp: 12000, dealerPrice: 10200, gst: 1800, status: "active" },
    { name: "Wheat atta 10 kg", sku: "FX-ATTA-10", brand: "Femxo Select", category: "Staples", mrp: 46500, dealerPrice: 40900, gst: 500, status: "active" },
    { name: "Toor dal 1 kg", sku: "FX-DAL-1KG", brand: "Femxo Select", category: "Pulses", mrp: 17800, dealerPrice: 15600, gst: 500, status: "active" },
    { name: "Mustard oil 1 L", sku: "FX-MUS-1L", brand: "Femxo Select", category: "Edible oil", mrp: 19900, dealerPrice: 17300, gst: 500, status: "active" },
    { name: "Detergent powder 1 kg", sku: "FX-DET-1KG", brand: "Femxo Daily", category: "Home care", mrp: 11500, dealerPrice: 9400, gst: 1800, status: "draft" },
    { name: "Tea 500 g", sku: "FX-TEA-500", brand: "Femxo Daily", category: "Beverages", mrp: 26000, dealerPrice: 22400, gst: 500, status: "active" },
    { name: "Iodised salt 1 kg", sku: "FX-SALT-1KG", brand: "Femxo Select", category: "Staples", mrp: 2800, dealerPrice: 2300, gst: 0, status: "active" },
    { name: "Festive gift box", sku: "FX-GIFT-24", brand: "Femxo Daily", category: "Seasonal", mrp: 89900, dealerPrice: 74500, gst: 1800, status: "archived" },
  ]),

  dealers: rows("dlr", [
    { code: "DL-0001", name: "Anand Agencies", owner: "Vikash Anand", district: "Patna", phone: "98•••••210", gstin: "10AAAAA0000A1Z5", wallet: 64000000, joined: "2026-10-12", status: "active" },
    { code: "DL-0002", name: "Kosi Distribution Co.", owner: "Manoj Jha", district: "Saharsa", phone: "97•••••114", gstin: "10BBBBB1111B1Z2", wallet: 9820000, joined: "2026-10-18", status: "in_review" },
    { code: "DL-0003", name: "Rohit Mercantile", owner: "Rohit Agarwal", district: "Purnia", phone: "99•••••502", gstin: "10CCCCC2222C1Z9", wallet: 0, joined: "2026-08-04", status: "suspended" },
    { code: "DL-0004", name: "Bihar Agro Mart", owner: "Sanjeev Mishra", district: "Bhagalpur", phone: "94•••••870", gstin: "10DDDDD3333D1Z6", wallet: 0, joined: "2026-10-21", status: "submitted" },
    { code: "DL-0005", name: "Mithila Traders", owner: "Kavita Jha", district: "Darbhanga", phone: "93•••••441", gstin: "10EEEEE4444E1Z3", wallet: 21540000, joined: "2026-07-19", status: "active" },
    { code: "DL-0006", name: "Magadh Supply", owner: "Deepak Prasad", district: "Gaya", phone: "90•••••318", gstin: "10FFFFF5555F1Z0", wallet: 33200000, joined: "2026-06-02", status: "active" },
    { code: "DL-0007", name: "Tirhut Wholesale", owner: "Arvind Shahi", district: "Muzaffarpur", phone: "88•••••905", gstin: "10GGGGG6666G1Z7", wallet: 41850000, joined: "2026-05-28", status: "active" },
    { code: "DL-0008", name: "Champaran Distributors", owner: "Imran Ansari", district: "Purbi Champaran", phone: "87•••••266", gstin: "10HHHHH7777H1Z4", wallet: 17600000, joined: "2026-06-15", status: "active" },
    { code: "DL-0009", name: "Saran Trading", owner: "Pankaj Singh", district: "Saran", phone: "86•••••730", gstin: "10JJJJJ8888J1Z1", wallet: 0, joined: "2026-10-16", status: "changes_requested" },
    { code: "DL-0010", name: "Vaishali Enterprises", owner: "Ritu Kumari", district: "Vaishali", phone: "85•••••159", gstin: "10KKKKK9999K1Z8", wallet: 12900000, joined: "2026-07-07", status: "active" },
    { code: "DL-0011", name: "Bhojpur Agencies", owner: "Ajay Tiwari", district: "Bhojpur", phone: "84•••••682", gstin: "10LLLLL0000L1Z5", wallet: 8750000, joined: "2026-08-21", status: "active" },
    { code: "DL-0012", name: "Ganga Fresh Distributors", owner: "Sudha Devi", district: "Begusarai", phone: "83•••••047", gstin: "10MMMMM1111M1Z2", wallet: 0, joined: "2026-10-20", status: "in_review" },
    { code: "DL-0013", name: "Siwan Mart", owner: "Nitin Gupta", district: "Siwan", phone: "82•••••391", gstin: "10NNNNN2222N1Z9", wallet: 0, joined: "2026-09-10", status: "rejected" },
    { code: "DL-0014", name: "Nalanda Goods", owner: "Rajesh Paswan", district: "Nalanda", phone: "81•••••826", gstin: "10PPPPP3333P1Z6", wallet: 15400000, joined: "2026-06-30", status: "active" },
  ]),

  subDealers: rows("sdl", [
    { code: "SD-0001", name: "Lakshmi Stores", parent: "Champaran Distributors", village: "Raxaul", district: "Purbi Champaran", phone: "79•••••512", joined: "2026-10-22", status: "submitted" },
    { code: "SD-0002", name: "Shiv Kirana", parent: "Anand Agencies", village: "Danapur", district: "Patna", phone: "78•••••903", joined: "2026-09-02", status: "active" },
    { code: "SD-0003", name: "Maa Durga General Store", parent: "Magadh Supply", village: "Bodh Gaya", district: "Gaya", phone: "77•••••284", joined: "2026-08-11", status: "active" },
    { code: "SD-0004", name: "Ram Bharose Traders", parent: "Tirhut Wholesale", village: "Kanti", district: "Muzaffarpur", phone: "76•••••645", joined: "2026-10-19", status: "in_review" },
    { code: "SD-0005", name: "Gupta Provision", parent: "Mithila Traders", village: "Benipur", district: "Darbhanga", phone: "75•••••037", joined: "2026-07-28", status: "active" },
    { code: "SD-0006", name: "Kisan Seva Kendra", parent: "Vaishali Enterprises", village: "Lalganj", district: "Vaishali", phone: "74•••••468", joined: "2026-10-20", status: "submitted" },
    { code: "SD-0007", name: "Annapoorna Mart", parent: "Anand Agencies", village: "Phulwari", district: "Patna", phone: "73•••••821", joined: "2026-09-14", status: "active" },
    { code: "SD-0008", name: "Sita Ram Stores", parent: "Bhojpur Agencies", village: "Jagdishpur", district: "Bhojpur", phone: "72•••••156", joined: "2026-08-30", status: "suspended" },
    { code: "SD-0009", name: "Jai Mata Di Kirana", parent: "Nalanda Goods", village: "Rajgir", district: "Nalanda", phone: "71•••••779", joined: "2026-10-21", status: "in_review" },
    { code: "SD-0010", name: "New Bihar Stores", parent: "Champaran Distributors", village: "Sugauli", district: "Purbi Champaran", phone: "70•••••302", joined: "2026-10-17", status: "changes_requested" },
  ]),

  stock: rows("stk", [
    { product: "Edible oil 1 L", warehouse: "Patna WH", batch: "B-2198", qty: 18, expiry: "2027-03-31", status: "low_stock" },
    { product: "Biscuit pack (12)", warehouse: "Patna WH", batch: "B-2210", qty: 640, expiry: "2026-11-14", status: "expiring" },
    { product: "Rice 25 kg", warehouse: "Gaya WH", batch: "B-2175", qty: 40, expiry: "2027-06-30", status: "low_stock" },
    { product: "Staples bundle 5 kg", warehouse: "Patna WH", batch: "B-2201", qty: 2140, expiry: "2027-04-15", status: "healthy" },
    { product: "Personal care kit", warehouse: "Muzaffarpur WH", batch: "B-2189", qty: 860, expiry: "2028-01-31", status: "healthy" },
    { product: "Toor dal 1 kg", warehouse: "Gaya WH", batch: "B-2160", qty: 0, expiry: "2027-02-28", status: "out_of_stock" },
    { product: "Wheat atta 10 kg", warehouse: "Muzaffarpur WH", batch: "B-2207", qty: 1210, expiry: "2027-01-20", status: "healthy" },
    { product: "Tea 500 g", warehouse: "Patna WH", batch: "B-2183", qty: 75, expiry: "2027-05-10", status: "low_stock" },
    { product: "Mustard oil 1 L", warehouse: "Gaya WH", batch: "B-2194", qty: 930, expiry: "2027-03-15", status: "healthy" },
  ]),

  transfers: rows("trf", [
    { code: "TR-1042", from: "Patna WH", to: "Gaya WH", lines: 6, units: 1240, requestedBy: "Sunil Yadav", date: "2026-10-23", status: "in_transit" },
    { code: "TR-1043", from: "Muzaffarpur WH", to: "Patna WH", lines: 3, units: 420, requestedBy: "Sunil Yadav", date: "2026-10-23", status: "requested" },
    { code: "TR-1041", from: "Gaya WH", to: "Patna WH", lines: 2, units: 180, requestedBy: "Rakesh Kumar", date: "2026-10-22", status: "approved" },
    { code: "TR-1039", from: "Patna WH", to: "Muzaffarpur WH", lines: 8, units: 2310, requestedBy: "Sunil Yadav", date: "2026-10-19", status: "received" },
    { code: "TR-1037", from: "Patna WH", to: "Gaya WH", lines: 1, units: 60, requestedBy: "Rakesh Kumar", date: "2026-10-15", status: "cancelled" },
  ]),

  adjustments: rows("adj", [
    { code: "ADJ-0311", warehouse: "Patna WH", type: "Damage", units: -24, reason: "Leaking cartons (oil)", requestedBy: "Sunil Yadav", status: "submitted" },
    { code: "ADJ-0310", warehouse: "Gaya WH", type: "Count correction", units: 6, reason: "Cycle count", requestedBy: "Sunil Yadav", status: "posted" },
    { code: "ADJ-0309", warehouse: "Patna WH", type: "Expiry write-off", units: -120, reason: "Batch B-2102 expired", requestedBy: "Sunil Yadav", status: "posted" },
    { code: "ADJ-0308", warehouse: "Muzaffarpur WH", type: "Damage", units: -8, reason: "Rodent damage", requestedBy: "Sunil Yadav", status: "rejected" },
  ]),

  primeSubscriptions: rows("sub", [
    { customer: "Pooja Kumari", plan: "Prime Annual", district: "Patna", start: "2026-01-12", end: "2027-01-12", status: "active" },
    { customer: "Rahul Verma", plan: "Prime Quarterly", district: "Gaya", start: "2026-08-01", end: "2026-10-30", status: "expiring" },
    { customer: "Sunita Devi", plan: "Prime Monthly", district: "Muzaffarpur", start: "2026-10-05", end: "2026-11-04", status: "active" },
    { customer: "Md. Arif", plan: "Prime Annual", district: "Darbhanga", start: "2025-10-20", end: "2026-10-20", status: "expired" },
    { customer: "Kiran Singh", plan: "Prime Quarterly", district: "Patna", start: "2026-09-15", end: "2026-12-14", status: "active" },
    { customer: "Anjali Mishra", plan: "Prime Monthly", district: "Bhagalpur", start: "2026-10-22", end: "2026-11-21", status: "pending" },
    { customer: "Rohan Kumar", plan: "Prime Monthly", district: "Saran", start: "2026-09-01", end: "2026-10-01", status: "cancelled" },
  ]),

  primePlans: rows("pln", [
    { name: "Prime Monthly", price: 9900, duration: 30, members: 18240, status: "active" },
    { name: "Prime Quarterly", price: 26900, duration: 90, members: 21610, status: "active" },
    { name: "Prime Annual", price: 99900, duration: 365, members: 13030, status: "active" },
    { name: "Festive Trial", price: 4900, duration: 15, members: 0, status: "archived" },
  ]),

  customers: rows("cus", [
    { name: "Pooja Kumari", phone: "98•••••301", district: "Patna", prime: "Annual", orders: 14, joined: "2026-01-12", status: "active" },
    { name: "Rahul Verma", phone: "97•••••822", district: "Gaya", prime: "Quarterly", orders: 6, joined: "2026-03-04", status: "active" },
    { name: "Sunita Devi", phone: "96•••••417", district: "Muzaffarpur", prime: "Monthly", orders: 9, joined: "2026-02-19", status: "active" },
    { name: "Md. Arif", phone: "95•••••058", district: "Darbhanga", prime: "—", orders: 3, joined: "2025-10-20", status: "active" },
    { name: "Kiran Singh", phone: "94•••••669", district: "Patna", prime: "Quarterly", orders: 11, joined: "2026-04-08", status: "active" },
    { name: "Anjali Mishra", phone: "93•••••274", district: "Bhagalpur", prime: "Monthly", orders: 1, joined: "2026-10-22", status: "active" },
    { name: "Deepa Kumari", phone: "92•••••935", district: "Saran", prime: "—", orders: 0, joined: "2026-10-01", status: "blocked" },
  ]),

  orders: rows("ord", [
    { code: "ORD-58231", buyer: "Shiv Kirana", channel: "Partner", district: "Patna", amount: 4825000, payment: "Wallet", date: "2026-10-23T10:20:00+05:30", status: "placed" },
    { code: "ORD-58230", buyer: "Pooja Kumari", channel: "Customer app", district: "Patna", amount: 214000, payment: "Online", date: "2026-10-23T10:02:00+05:30", status: "confirmed" },
    { code: "ORD-58226", buyer: "Maa Durga General Store", channel: "Partner", district: "Gaya", amount: 2690000, payment: "Wallet", date: "2026-10-23T09:11:00+05:30", status: "packed" },
    { code: "ORD-58219", buyer: "Rahul Verma", channel: "Field staff", district: "Gaya", amount: 89500, payment: "COD", date: "2026-10-22T19:40:00+05:30", status: "dispatched" },
    { code: "ORD-58204", buyer: "Gupta Provision", channel: "Partner", district: "Darbhanga", amount: 3710000, payment: "Wallet", date: "2026-10-22T15:25:00+05:30", status: "delivered" },
    { code: "ORD-58198", buyer: "Sunita Devi", channel: "Customer app", district: "Muzaffarpur", amount: 132000, payment: "Online", date: "2026-10-22T12:05:00+05:30", status: "delivery_failed" },
    { code: "ORD-58187", buyer: "Annapoorna Mart", channel: "Partner", district: "Patna", amount: 1960000, payment: "Wallet", date: "2026-10-21T17:50:00+05:30", status: "delivered" },
    { code: "ORD-58170", buyer: "Kiran Singh", channel: "Customer app", district: "Patna", amount: 76000, payment: "Online", date: "2026-10-21T11:30:00+05:30", status: "cancelled" },
    { code: "ORD-58161", buyer: "Anand Agencies", channel: "Partner", district: "Patna", amount: 12450000, payment: "Wallet", date: "2026-10-20T16:10:00+05:30", status: "delivered" },
    { code: "ORD-58149", buyer: "Md. Arif", channel: "Field staff", district: "Darbhanga", amount: 45500, payment: "COD", date: "2026-10-20T10:45:00+05:30", status: "delivered" },
  ]),

  invoices: rows("inv", [
    { number: "FX/26-27/000412", buyer: "Anand Agencies", gstin: "10AAAAA0000A1Z5", amount: 12450000, issued: "2026-10-20", einvoice: "Generated", status: "generated" },
    { number: "FX/26-27/000415", buyer: "Gupta Provision", gstin: "—", amount: 3710000, issued: "2026-10-22", einvoice: "Not required", status: "not_required" },
    { number: "FX/26-27/000417", buyer: "Mithila Traders", gstin: "10EEEEE4444E1Z3", amount: 8820000, issued: "2026-10-22", einvoice: "Retrying", status: "retrying" },
    { number: "FX/26-27/000418", buyer: "Magadh Supply", gstin: "10FFFFF5555F1Z0", amount: 6430000, issued: "2026-10-23", einvoice: "Pending", status: "pending" },
    { number: "FX/26-27/000419", buyer: "Tirhut Wholesale", gstin: "10GGGGG6666G1Z7", amount: 9915000, issued: "2026-10-23", einvoice: "Pending", status: "pending" },
    { number: "FX/26-27/000409", buyer: "Vaishali Enterprises", gstin: "10KKKKK9999K1Z8", amount: 4210000, issued: "2026-10-19", einvoice: "Dead-letter", status: "dead_letter" },
    { number: "FX/26-27/000401", buyer: "Nalanda Goods", gstin: "10PPPPP3333P1Z6", amount: 2875000, issued: "2026-10-17", einvoice: "Cancelled", status: "cancelled" },
  ]),

  settlements: rows("stl", [
    { code: "ST-2210", partner: "Anand Agencies", period: "1–15 Oct 2026", amount: 12400000, maker: "Priya Sinha", created: "2026-10-22", status: "pending_review" },
    { code: "ST-2209", partner: "Tirhut Wholesale", period: "1–15 Oct 2026", amount: 9860000, maker: "Priya Sinha", created: "2026-10-22", status: "pending_review" },
    { code: "ST-2208", partner: "Magadh Supply", period: "1–15 Oct 2026", amount: 7420000, maker: "Priya Sinha", created: "2026-10-22", status: "approved" },
    { code: "ST-2204", partner: "Mithila Traders", period: "16–30 Sep 2026", amount: 6150000, maker: "Priya Sinha", created: "2026-10-02", status: "released" },
    { code: "ST-2201", partner: "Vaishali Enterprises", period: "16–30 Sep 2026", amount: 3980000, maker: "Priya Sinha", created: "2026-10-01", status: "paid" },
    { code: "ST-2199", partner: "Bhojpur Agencies", period: "16–30 Sep 2026", amount: 2240000, maker: "Priya Sinha", created: "2026-10-01", status: "failed" },
    { code: "ST-2196", partner: "Rohit Mercantile", period: "1–15 Sep 2026", amount: 1870000, maker: "Priya Sinha", created: "2026-09-17", status: "reversed" },
  ]),

  wallets: rows("wal", [
    { partner: "Anand Agencies", kind: "Dealer", balance: 64000000, held: 12400000, lastTxn: "2026-10-23T10:20:00+05:30", status: "active" },
    { partner: "Tirhut Wholesale", kind: "Dealer", balance: 41850000, held: 9860000, lastTxn: "2026-10-22T15:01:00+05:30", status: "active" },
    { partner: "Magadh Supply", kind: "Dealer", balance: 33200000, held: 7420000, lastTxn: "2026-10-23T09:11:00+05:30", status: "active" },
    { partner: "Mithila Traders", kind: "Dealer", balance: 21540000, held: 0, lastTxn: "2026-10-22T15:25:00+05:30", status: "active" },
    { partner: "Kosi Distribution Co.", kind: "Dealer", balance: 9820000, held: 0, lastTxn: "2026-10-18T12:00:00+05:30", status: "active" },
    { partner: "Shiv Kirana", kind: "Sub-dealer", balance: 1240000, held: 0, lastTxn: "2026-10-23T10:20:00+05:30", status: "active" },
    { partner: "Rohit Mercantile", kind: "Dealer", balance: 0, held: 0, lastTxn: "2026-09-17T11:00:00+05:30", status: "suspended" },
  ]),

  reports: rows("rep", [
    { name: "Sales by district", range: "FY 2026-27 (to date)", format: "XLSX", requestedBy: "Munni S.", requested: "2026-10-23T10:35:00+05:30", status: "queued" },
    { name: "Dealer wallet statement", range: "1–15 Oct 2026", format: "CSV", requestedBy: "Priya Sinha", requested: "2026-10-23T10:12:00+05:30", status: "processing" },
    { name: "GST sales register", range: "Sep 2026", format: "XLSX", requestedBy: "Priya Sinha", requested: "2026-10-22T16:40:00+05:30", status: "completed" },
    { name: "Stock ledger", range: "Last 30 days", format: "CSV", requestedBy: "Sunil Yadav", requested: "2026-10-22T11:05:00+05:30", status: "completed" },
    { name: "Prime churn", range: "Last 90 days", format: "XLSX", requestedBy: "Rakesh Kumar", requested: "2026-10-21T09:30:00+05:30", status: "failed" },
    { name: "Orders by channel", range: "Aug 2026", format: "CSV", requestedBy: "Rakesh Kumar", requested: "2026-09-02T10:00:00+05:30", status: "expired" },
  ]),

  deliveries: rows("dlv", [
    { template: "Login OTP", channel: "SMS", recipient: "98•••••210", attempts: 3, at: "2026-10-23T10:28:00+05:30", status: "dead_letter" },
    { template: "Order dispatched", channel: "SMS", recipient: "97•••••822", attempts: 2, at: "2026-10-23T10:05:00+05:30", status: "retrying" },
    { template: "KYC approved", channel: "Email", recipient: "v•••@demo.femxo.test", attempts: 1, at: "2026-10-23T10:43:00+05:30", status: "delivered" },
    { template: "Settlement released", channel: "SMS", recipient: "93•••••441", attempts: 1, at: "2026-10-22T18:02:00+05:30", status: "delivered" },
    { template: "Prime expiring", channel: "SMS", recipient: "97•••••822", attempts: 1, at: "2026-10-23T08:00:00+05:30", status: "sent" },
    { template: "Order placed", channel: "SMS", recipient: "78•••••903", attempts: 0, at: "2026-10-23T10:21:00+05:30", status: "queued" },
  ]),

  templates: rows("tpl", [
    { key: "auth.otp", name: "Login OTP", channel: "SMS", dlt: "DLT-1107•••", updated: "2026-10-12", status: "active" },
    { key: "order.dispatched", name: "Order dispatched", channel: "SMS", dlt: "DLT-1107•••", updated: "2026-10-12", status: "active" },
    { key: "kyc.approved", name: "KYC approved", channel: "Email", dlt: "—", updated: "2026-10-15", status: "active" },
    { key: "settlement.released", name: "Settlement released", channel: "SMS", dlt: "DLT-1107•••", updated: "2026-10-15", status: "active" },
    { key: "prime.expiring", name: "Prime expiring", channel: "SMS", dlt: "Pending", updated: "2026-10-20", status: "draft" },
  ]),

  integrations: rows("int", [
    { name: "SMS gateway", provider: "SMS vendor (TBD)", secret: "•••• a9f2", lastSuccess: "2026-10-23T10:24:00+05:30", queue: "OTP queue · 1 dead-letter", status: "degraded" },
    { name: "GST e-invoice (GSP)", provider: "GSP vendor (TBD)", secret: "•••• 7c1e", lastSuccess: "2026-10-23T09:50:00+05:30", queue: "Retrying · next in 6 min", status: "degraded" },
    { name: "Email", provider: "Email service", secret: "•••• 33d0", lastSuccess: "2026-10-23T10:43:00+05:30", queue: "Healthy", status: "enabled" },
    { name: "Payout rail", provider: "Not connected", secret: "Not set", lastSuccess: null, queue: "Manual bank transfer (UTR)", status: "disabled" },
    { name: "WhatsApp", provider: "Not connected", secret: "Not set", lastSuccess: null, queue: "—", status: "disabled" },
  ]),

  deadLetters: rows("dlq", [
    { job: "notification.sms", queue: "notifications", reason: "Provider timeout (3 retries exhausted)", attempts: 3, failedAt: "2026-10-23T10:28:00+05:30", status: "open" },
    { job: "invoice.einvoice_generate", queue: "einvoice", reason: "GSP rejected: buyer GSTIN inactive", attempts: 1, failedAt: "2026-10-19T14:02:00+05:30", status: "open" },
    { job: "report.generate", queue: "reports", reason: "Analytics node timeout", attempts: 3, failedAt: "2026-10-21T09:41:00+05:30", status: "retried" },
  ]),

  gstins: rows("gst", [
    { gstin: "10AABCF0000F1Z1", state: "Bihar", address: "College Road, Raxaul", primary: "Primary", status: "active" },
    { gstin: "10AABCF0000F2Z0", state: "Bihar", address: "Patna warehouse", primary: "Additional", status: "active" },
  ]),
};
