export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Portals", href: "#portals" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
] as const;

export const STATS = [
  { value: 10000, suffix: "+", label: "Active Dealers" },
  { value: 500, suffix: "+", label: "Cities Covered" },
  { value: 1000000, suffix: "+", label: "Orders Processed" },
  { value: 100, suffix: "Cr+", label: "GMV Handled", prefix: "₹" },
] as const;

export const FEATURES = [
  {
    icon: "Package",
    title: "Smart Inventory",
    description: "Real-time multi-warehouse inventory with FEFO allocation and batch tracking.",
  },
  {
    icon: "Wallet",
    title: "Wallet & Ledger",
    description: "Double-entry ledger with ACID guarantees for commissions and settlements.",
  },
  {
    icon: "Receipt",
    title: "GST Billing",
    description: "GST-compliant invoices with e-invoice, IRN, and automated tax computation.",
  },
  {
    icon: "Users",
    title: "Multi-Portal",
    description: "Separate portals for Super Admin, Dealer, Sub-Dealer, and Customer.",
  },
  {
    icon: "TrendingUp",
    title: "Commission Engine",
    description: "Configurable rules engine for dealer, sub-dealer, retail, and prime commissions.",
  },
  {
    icon: "Sparkles",
    title: "AI-Powered",
    description: "Demand forecasting, route optimization, and fraud detection built-in.",
  },
] as const;

export const PORTALS = [
  {
    id: "super-admin",
    label: "Super Admin",
    title: "Command Center for Your Business",
    features: [
      "Company-wide analytics and KPIs",
      "Multi-tenant and org hierarchy",
      "Commission rule engine",
      "Financial reconciliation",
    ],
  },
  {
    id: "dealer",
    label: "Dealer",
    title: "Grow Your Distribution Network",
    features: [
      "Sub-dealer onboarding and KYC",
      "Territory allocation",
      "Wallet and settlement tracking",
      "Commission reports (dealer + sub-dealer)",
    ],
  },
  {
    id: "sub-dealer",
    label: "Sub-Dealer",
    title: "Village-Level Operations",
    features: [
      "Offline-first daily sales entry",
      "Village allocation without overlap",
      "Monthly commission accrual",
      "Retail partner management",
    ],
  },
  {
    id: "customer",
    label: "Customer",
    title: "Shop Smart, Save More",
    features: [
      "Personalized product discovery",
      "Prime membership with coupons",
      "Real-time order tracking",
      "Multiple payment options",
    ],
  },
] as const;

export const PRICING = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for individual dealers getting started",
    features: [
      "Up to 500 products",
      "1 sub-dealer",
      "Basic reports",
      "Email support",
      "GST billing",
    ],
    cta: "Coming Soon",
    highlighted: false,
  },
  {
    name: "Growth",
    price: 999,
    period: "per month",
    description: "For growing dealer networks and sub-dealers",
    features: [
      "Unlimited products",
      "Up to 10 sub-dealers",
      "Advanced analytics",
      "Priority support",
      "Commission engine",
      "API access",
    ],
    cta: "Coming Soon",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: null,
    period: "custom",
    description: "For large distributors and enterprises",
    features: [
      "Everything in Growth",
      "Unlimited sub-dealers",
      "Dedicated account manager",
      "Custom integrations",
      "SLA + 24×7 support",
      "On-premise option",
    ],
    cta: "Coming Soon",
    highlighted: false,
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    role: "Master Dealer",
    city: "Patna, Bihar",
    quote: "FEMXO ne meri poori distribution network ko digital kar diya. Commission tracking ab bilkul transparent hai.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Sub-Dealer",
    city: "Jaipur, Rajasthan",
    quote: "Offline mode ki wajah se gaon me bhi sales entry kar pata hoon. Sync automatic ho jata hai.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Distributor",
    city: "Ahmedabad, Gujarat",
    quote: "GST billing aur e-invoice integration ne compliance ka kaam 10x easy bana diya.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "Retail Partner",
    city: "Hyderabad, Telangana",
    quote: "Wallet ledger bilkul clear hai. Har transaction ka trail milta hai. Trust badh gaya hai.",
    rating: 5,
  },
  {
    name: "Mohammed Irfan",
    role: "Super Stockist",
    city: "Lucknow, UP",
    quote: "500+ cities me operations manage karna pehle impossible tha. FEMXO se possible ho gaya.",
    rating: 5,
  },
  {
    name: "Kavita Singh",
    role: "Dealer",
    city: "Bhopal, MP",
    quote: "Customer portal se direct orders aa rahe hain. Business 3x grow hua 6 months me.",
    rating: 5,
  },
] as const;

export const FAQS = [
  {
    question: "FEMXO ERP kya hai?",
    answer:
      "FEMXO ERP ek multi-portal platform hai jo dealers, sub-dealers, retail partners, aur customers ko ek hi platform pe connect karta hai. Inventory, orders, commissions, settlements, aur GST billing — sab kuch integrated.",
  },
  {
    question: "Kya main free me start kar sakta hoon?",
    answer:
      "Haan. Starter plan bilkul free hai — 500 products aur 1 sub-dealer ke saath. Growth plan ka 14-day free trial bhi available hai bina credit card ke.",
  },
  {
    question: "Offline mode kaam karta hai?",
    answer:
      "Haan. Sub-dealer portal offline-first hai. Internet na hone par bhi sales entry kar sakte ho. Connectivity aane par automatic sync ho jata hai.",
  },
  {
    question: "GST aur e-invoice support hai?",
    answer:
      "Haan. Complete GST compliance — tax invoices, credit/debit notes, e-invoice via GSTN, IRN generation, aur GSTR-ready reports.",
  },
  {
    question: "Commission calculation automatic hai?",
    answer:
      "Haan. Configurable rules engine hai — percentage, flat, tiered, category-specific. Order delivery par automatic commission calculate hota hai aur wallet me credit.",
  },
  {
    question: "Kitne users support karte ho?",
    answer:
      "Architecture 1M+ concurrent users ke liye designed hai. 500k users tested, 1M tak scale karta hai.",
  },
  {
    question: "Data secure hai?",
    answer:
      "Haan. AES-256 encryption at rest, TLS 1.3 in transit, immutable audit logs, RBAC, aur DPDP Act 2023 compliant. ISO 27001 alignment.",
  },
  {
    question: "Kitne languages support karte ho?",
    answer:
      "Hindi, English, aur 10+ regional languages. Customer portal multi-language ready hai.",
  },
  {
    question: "Integrations kaunse hain?",
    answer:
      "Razorpay, Cashfree, MSG91, Twilio, WhatsApp Business, GSTN, Google Maps, Aadhaar eKYC, RazorpayX — sab pre-built integrations.",
  },
  {
    question: "Support kaise milta hai?",
    answer:
      "Email support (all plans), priority support (Growth), 24×7 dedicated support + account manager (Enterprise).",
  },
] as const;

export const INTEGRATIONS = [
  "Razorpay",
  "Cashfree",
  "GSTN",
  "MSG91",
  "WhatsApp",
  "Google Maps",
  "Firebase",
  "Aadhaar eKYC",
] as const;