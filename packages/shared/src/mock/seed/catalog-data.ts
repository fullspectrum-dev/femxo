/*
 * Hand-written catalogue templates. Brands are fictional (no real company's
 * name or trademark appears in the demo). MRPs are in rupees here and
 * converted to paise by the generator. GST uses only the company's rates:
 * 0 / 5 / 18 / 40% (as basis points).
 */

export type PackShape = "bag" | "bottle" | "box" | "jar" | "pouch" | "tube" | "bar" | "carton";

export interface ItemTemplate {
  name: string;
  sizes: readonly (readonly [label: string, mrpRupees: number])[];
  gstBps?: number;
  shape: PackShape;
}

export interface SubcategoryTemplate {
  slug: string;
  name: string;
  brands: readonly string[];
  items: readonly ItemTemplate[];
}

export interface TopCategoryTemplate {
  slug: string;
  name: string;
  /** Default GST for the category's items. */
  gstBps: number;
  /** Days a batch keeps; drives "best before". */
  shelfLifeDays: number;
  returnable: boolean;
  blurb: string;
  highlights: readonly string[];
  subcategories: readonly SubcategoryTemplate[];
}

export const BRANDS = [
  "Femxo Select", "Femxo Daily", "Gangotri Farms", "Mithila Gold", "Kosi Valley", "Magadh Mills", "Sonpur Organics",
  "Vaishali Fresh", "Rajgir Naturals", "Bodhi Care", "Champaran Harvest", "Patliputra Foods", "Tirhut Spices", "Saran Snacks",
  "Nalanda Home", "Ganga Breeze", "Arghya", "Hillcrest Tea", "Brew & Co", "NutriGrow", "Crunchy Bites", "Madhur Sweets",
  "Sparkle Clean", "Shubh Utsav", "WarmNest",
] as const;

const FOOD_HIGHLIGHTS = ["Sealed for freshness", "FSSAI-licensed packer", "Packed in India"] as const;

export const CATEGORY_TEMPLATES: readonly TopCategoryTemplate[] = [
  {
    slug: "staples",
    name: "Staples",
    gstBps: 500,
    shelfLifeDays: 180,
    returnable: false,
    blurb: "an everyday kitchen staple, cleaned and packed for consistent quality",
    highlights: FOOD_HIGHLIGHTS,
    subcategories: [
      {
        slug: "atta-flours",
        name: "Atta & flours",
        brands: ["Femxo Select", "Magadh Mills", "Gangotri Farms"],
        items: [
          { name: "Chakki fresh atta", sizes: [["5 kg", 265], ["10 kg", 499]], shape: "bag" },
          { name: "Multigrain atta", sizes: [["5 kg", 335]], shape: "bag" },
          { name: "Maida", sizes: [["500 g", 32], ["1 kg", 58]], shape: "pouch" },
          { name: "Sooji", sizes: [["500 g", 34], ["1 kg", 62]], shape: "pouch" },
        ],
      },
      {
        slug: "rice-poha",
        name: "Rice & poha",
        brands: ["Kosi Valley", "Champaran Harvest", "Femxo Select"],
        items: [
          { name: "Basmati rice", sizes: [["1 kg", 139], ["5 kg", 649]], shape: "bag" },
          { name: "Sona masoori rice", sizes: [["5 kg", 389], ["10 kg", 749]], shape: "bag" },
          { name: "Katarni rice", sizes: [["1 kg", 120], ["5 kg", 560]], shape: "bag" },
          { name: "Thick poha", sizes: [["500 g", 45], ["1 kg", 84]], shape: "pouch" },
        ],
      },
      {
        slug: "sugar-salt-jaggery",
        name: "Sugar, salt & jaggery",
        brands: ["Champaran Harvest", "Femxo Select", "Mithila Gold"],
        items: [
          { name: "Sugar", sizes: [["1 kg", 50], ["5 kg", 240]], shape: "bag" },
          { name: "Iodised salt", sizes: [["1 kg", 28]], gstBps: 0, shape: "pouch" },
          { name: "Rock salt", sizes: [["500 g", 45]], gstBps: 0, shape: "pouch" },
          { name: "Jaggery", sizes: [["1 kg", 90]], gstBps: 0, shape: "box" },
        ],
      },
      {
        slug: "masala-spices",
        name: "Masala & spices",
        brands: ["Tirhut Spices", "Sonpur Organics", "Femxo Select"],
        items: [
          { name: "Turmeric powder", sizes: [["100 g", 38], ["200 g", 72]], shape: "box" },
          { name: "Red chilli powder", sizes: [["100 g", 45], ["200 g", 86]], shape: "box" },
          { name: "Garam masala", sizes: [["50 g", 55], ["100 g", 99]], shape: "box" },
          { name: "Coriander powder", sizes: [["100 g", 32], ["200 g", 60]], shape: "box" },
          { name: "Meat masala", sizes: [["100 g", 75]], shape: "box" },
        ],
      },
    ],
  },
  {
    slug: "edible-oil",
    name: "Edible oil",
    gstBps: 500,
    shelfLifeDays: 270,
    returnable: false,
    blurb: "cooking oil for daily Indian cooking, sealed against air and light",
    highlights: ["Tamper-evident seal", "No added colour", "Packed in India"],
    subcategories: [
      {
        slug: "mustard-oil",
        name: "Mustard oil",
        brands: ["Femxo Select", "Mithila Gold", "Gangotri Farms", "Kosi Valley"],
        items: [
          { name: "Kachi ghani mustard oil", sizes: [["1 L", 199], ["5 L", 945]], shape: "bottle" },
          { name: "Mustard oil pouch", sizes: [["1 L", 185]], shape: "pouch" },
        ],
      },
      {
        slug: "refined-oil",
        name: "Refined oil",
        brands: ["Femxo Select", "Patliputra Foods", "Gangotri Farms"],
        items: [
          { name: "Refined soybean oil", sizes: [["1 L", 155], ["5 L", 735]], shape: "bottle" },
          { name: "Sunflower oil", sizes: [["1 L", 175], ["5 L", 830]], shape: "bottle" },
          { name: "Rice bran oil", sizes: [["1 L", 185]], shape: "bottle" },
        ],
      },
      {
        slug: "ghee-vanaspati",
        name: "Ghee & vanaspati",
        brands: ["Mithila Gold", "Gangotri Farms", "Femxo Select"],
        items: [
          { name: "Desi ghee", sizes: [["500 ml", 330], ["1 L", 640]], shape: "jar" },
          { name: "Cow ghee", sizes: [["1 L", 699]], shape: "jar" },
          { name: "Vanaspati", sizes: [["1 L", 160]], shape: "jar" },
        ],
      },
    ],
  },
  {
    slug: "pulses",
    name: "Pulses & dal",
    gstBps: 500,
    shelfLifeDays: 270,
    returnable: false,
    blurb: "cleaned, sorted pulses for dal, curries and snacks",
    highlights: ["Machine-cleaned and sorted", "Unpolished", "Packed in India"],
    subcategories: [
      {
        slug: "toor-moong",
        name: "Toor, moong & masoor",
        brands: ["Femxo Select", "Kosi Valley", "Sonpur Organics"],
        items: [
          { name: "Toor dal", sizes: [["500 g", 92], ["1 kg", 178]], shape: "pouch" },
          { name: "Moong dal", sizes: [["500 g", 74], ["1 kg", 142]], shape: "pouch" },
          { name: "Masoor dal", sizes: [["1 kg", 118]], shape: "pouch" },
          { name: "Urad dal", sizes: [["1 kg", 156]], shape: "pouch" },
        ],
      },
      {
        slug: "chana-besan",
        name: "Chana, besan & sattu",
        brands: ["Magadh Mills", "Femxo Select", "Sonpur Organics"],
        items: [
          { name: "Chana dal", sizes: [["1 kg", 105]], shape: "pouch" },
          { name: "Besan", sizes: [["500 g", 62], ["1 kg", 118]], shape: "pouch" },
          { name: "Sattu", sizes: [["500 g", 75], ["1 kg", 140]], shape: "pouch" },
          { name: "Kabuli chana", sizes: [["1 kg", 165]], shape: "pouch" },
        ],
      },
      {
        slug: "rajma-pulses",
        name: "Rajma & other pulses",
        brands: ["Kosi Valley", "Sonpur Organics", "Femxo Select"],
        items: [
          { name: "Rajma", sizes: [["500 g", 95], ["1 kg", 180]], shape: "pouch" },
          { name: "Black chana", sizes: [["1 kg", 110]], shape: "pouch" },
          { name: "Lobia", sizes: [["500 g", 70]], shape: "pouch" },
        ],
      },
    ],
  },
  {
    slug: "snacks",
    name: "Snacks",
    gstBps: 500,
    shelfLifeDays: 150,
    returnable: false,
    blurb: "a snack for tea time, travel or a quick bite",
    highlights: FOOD_HIGHLIGHTS,
    subcategories: [
      {
        slug: "biscuits-cookies",
        name: "Biscuits & cookies",
        brands: ["Crunchy Bites", "Patliputra Foods", "Femxo Daily"],
        items: [
          { name: "Marie biscuits", sizes: [["250 g", 35], ["Pack of 4", 130]], shape: "box" },
          { name: "Butter cookies", sizes: [["200 g", 60]], shape: "box" },
          { name: "Cream biscuits", sizes: [["120 g", 30]], shape: "box" },
          { name: "Digestive biscuits", sizes: [["250 g", 70]], shape: "box" },
        ],
      },
      {
        slug: "namkeen",
        name: "Namkeen",
        brands: ["Saran Snacks", "Patliputra Foods", "Mithila Gold"],
        items: [
          { name: "Aloo bhujia", sizes: [["200 g", 55], ["400 g", 105]], shape: "pouch" },
          { name: "Khatta meetha", sizes: [["200 g", 55]], shape: "pouch" },
          { name: "Thekua", sizes: [["250 g", 90]], shape: "pouch" },
          { name: "Chana jor garam", sizes: [["150 g", 40]], shape: "pouch" },
        ],
      },
      {
        slug: "noodles-pasta",
        name: "Noodles & pasta",
        brands: ["Patliputra Foods", "Femxo Daily", "Crunchy Bites"],
        items: [
          { name: "Masala noodles", sizes: [["Pack of 4", 56], ["Pack of 8", 110]], shape: "pouch" },
          { name: "Atta noodles", sizes: [["Pack of 4", 68]], shape: "pouch" },
          { name: "Penne pasta", sizes: [["500 g", 95]], shape: "pouch" },
          { name: "Vermicelli", sizes: [["400 g", 48]], shape: "box" },
        ],
      },
      {
        slug: "chocolates-sweets",
        name: "Chocolates & sweets",
        brands: ["Madhur Sweets", "Mithila Gold", "Crunchy Bites"],
        items: [
          { name: "Milk chocolate bar", sizes: [["50 g", 50]], gstBps: 1800, shape: "bar" },
          { name: "Rasgulla tin", sizes: [["1 kg", 230]], shape: "jar" },
          { name: "Soan papdi", sizes: [["500 g", 150]], shape: "box" },
          { name: "Gulab jamun mix", sizes: [["200 g", 99]], shape: "box" },
        ],
      },
    ],
  },
  {
    slug: "beverages",
    name: "Beverages",
    gstBps: 500,
    shelfLifeDays: 300,
    returnable: false,
    blurb: "a drink for every part of the day",
    highlights: FOOD_HIGHLIGHTS,
    subcategories: [
      {
        slug: "tea",
        name: "Tea",
        brands: ["Hillcrest Tea", "Femxo Select", "Mithila Gold"],
        items: [
          { name: "CTC tea", sizes: [["250 g", 140], ["500 g", 270], ["1 kg", 520]], shape: "box" },
          { name: "Green tea bags", sizes: [["25 bags", 160]], shape: "box" },
          { name: "Masala chai", sizes: [["250 g", 165]], shape: "box" },
        ],
      },
      {
        slug: "coffee",
        name: "Coffee",
        brands: ["Brew & Co", "Femxo Select"],
        items: [
          { name: "Instant coffee", sizes: [["50 g", 170], ["100 g", 320]], gstBps: 1800, shape: "jar" },
          { name: "Filter coffee", sizes: [["200 g", 210]], gstBps: 1800, shape: "pouch" },
          { name: "Coffee premix", sizes: [["Pack of 10", 120]], gstBps: 1800, shape: "box" },
        ],
      },
      {
        slug: "juices-drinks",
        name: "Juices & drinks",
        brands: ["Vaishali Fresh", "Femxo Daily"],
        items: [
          { name: "Mango drink", sizes: [["600 ml", 40], ["1.2 L", 75]], gstBps: 1800, shape: "bottle" },
          { name: "Litchi juice", sizes: [["1 L", 110]], gstBps: 1800, shape: "carton" },
          { name: "Cola", sizes: [["750 ml", 40], ["2 L", 95]], gstBps: 4000, shape: "bottle" },
          { name: "Lemon soda", sizes: [["600 ml", 35]], gstBps: 4000, shape: "bottle" },
        ],
      },
      {
        slug: "health-drinks",
        name: "Health drinks",
        brands: ["NutriGrow", "Femxo Select"],
        items: [
          { name: "Chocolate health drink", sizes: [["500 g", 245]], gstBps: 1800, shape: "jar" },
          { name: "Malt drink", sizes: [["500 g", 230]], gstBps: 1800, shape: "jar" },
          { name: "Badam drink mix", sizes: [["200 g", 160]], gstBps: 1800, shape: "jar" },
        ],
      },
    ],
  },
  {
    slug: "personal-care",
    name: "Personal care",
    gstBps: 1800,
    shelfLifeDays: 730,
    // Hygiene products can't be returned once delivered.
    returnable: false,
    blurb: "for everyday personal care, dermatologically tested",
    highlights: ["Dermatologically tested", "Not tested on animals", "Made in India"],
    subcategories: [
      {
        slug: "soap-bodywash",
        name: "Soap & body wash",
        brands: ["Bodhi Care", "Rajgir Naturals", "Femxo Daily"],
        items: [
          { name: "Neem soap", sizes: [["100 g", 35], ["Pack of 4", 130]], shape: "bar" },
          { name: "Sandal soap", sizes: [["125 g", 45]], shape: "bar" },
          { name: "Body wash", sizes: [["250 ml", 199]], shape: "bottle" },
        ],
      },
      {
        slug: "hair-care",
        name: "Hair care",
        brands: ["Rajgir Naturals", "Bodhi Care", "Femxo Daily"],
        items: [
          { name: "Herbal shampoo", sizes: [["180 ml", 145], ["340 ml", 260]], shape: "bottle" },
          { name: "Coconut hair oil", sizes: [["200 ml", 95], ["500 ml", 220]], shape: "bottle" },
          { name: "Amla hair oil", sizes: [["200 ml", 110]], shape: "bottle" },
          { name: "Conditioner", sizes: [["180 ml", 160]], shape: "bottle" },
        ],
      },
      {
        slug: "oral-care",
        name: "Oral care",
        brands: ["Bodhi Care", "Femxo Daily", "Rajgir Naturals"],
        items: [
          { name: "Herbal toothpaste", sizes: [["150 g", 95], ["Pack of 2", 180]], shape: "tube" },
          { name: "Toothbrush", sizes: [["Pack of 4", 120]], shape: "box" },
          { name: "Mouthwash", sizes: [["250 ml", 149]], shape: "bottle" },
        ],
      },
      {
        slug: "skin-care",
        name: "Skin care",
        brands: ["Rajgir Naturals", "Bodhi Care"],
        items: [
          { name: "Aloe vera gel", sizes: [["150 g", 160]], shape: "tube" },
          { name: "Cold cream", sizes: [["100 ml", 130]], shape: "jar" },
          { name: "Sunscreen SPF 50", sizes: [["50 g", 299]], shape: "tube" },
          { name: "Face wash", sizes: [["100 ml", 145]], shape: "tube" },
        ],
      },
    ],
  },
  {
    slug: "home-care",
    name: "Home care",
    gstBps: 1800,
    shelfLifeDays: 730,
    returnable: true,
    blurb: "to keep the home clean and fresh",
    highlights: ["Safe on most surfaces", "Keep out of reach of children", "Made in India"],
    subcategories: [
      {
        slug: "detergents",
        name: "Detergents",
        brands: ["Sparkle Clean", "Nalanda Home", "Femxo Daily"],
        items: [
          { name: "Detergent powder", sizes: [["1 kg", 115], ["4 kg", 420]], shape: "bag" },
          { name: "Liquid detergent", sizes: [["1 L", 215], ["2 L", 399]], shape: "bottle" },
          { name: "Detergent bar", sizes: [["Pack of 4", 90]], shape: "bar" },
        ],
      },
      {
        slug: "dishwash",
        name: "Dishwash",
        brands: ["Sparkle Clean", "Nalanda Home", "Femxo Daily"],
        items: [
          { name: "Dishwash bar", sizes: [["Pack of 3", 60]], shape: "bar" },
          { name: "Dishwash gel", sizes: [["500 ml", 110], ["750 ml", 155]], shape: "bottle" },
          { name: "Scrub pads", sizes: [["Pack of 3", 45]], shape: "box" },
        ],
      },
      {
        slug: "cleaners-fresheners",
        name: "Cleaners & fresheners",
        brands: ["Ganga Breeze", "Nalanda Home", "Sparkle Clean"],
        items: [
          { name: "Floor cleaner", sizes: [["1 L", 185]], shape: "bottle" },
          { name: "Toilet cleaner", sizes: [["500 ml", 99]], shape: "bottle" },
          { name: "Glass cleaner", sizes: [["500 ml", 110]], shape: "bottle" },
          { name: "Room freshener", sizes: [["240 ml", 175]], shape: "bottle" },
        ],
      },
      {
        slug: "pooja-needs",
        name: "Pooja needs",
        brands: ["Arghya", "Femxo Daily", "Shubh Utsav"],
        items: [
          { name: "Agarbatti", sizes: [["Pack of 100", 65]], gstBps: 500, shape: "box" },
          { name: "Camphor", sizes: [["50 g", 70]], gstBps: 500, shape: "box" },
          { name: "Cotton wicks", sizes: [["Pack of 200", 40]], gstBps: 500, shape: "box" },
          { name: "Ghee diya", sizes: [["Pack of 12", 99]], gstBps: 500, shape: "box" },
        ],
      },
    ],
  },
  {
    slug: "seasonal",
    name: "Seasonal",
    gstBps: 500,
    shelfLifeDays: 120,
    returnable: false,
    blurb: "picked for the season and its festivals",
    highlights: ["Limited season stock", "Gift-ready packing", "Packed in India"],
    subcategories: [
      {
        slug: "festive-gift-packs",
        name: "Festive gift packs",
        brands: ["Shubh Utsav", "Madhur Sweets", "Femxo Select"],
        items: [
          { name: "Dry fruit gift box", sizes: [["500 g", 899]], shape: "box" },
          { name: "Sweets hamper", sizes: [["1 kg", 650]], shape: "box" },
          { name: "Festive grocery hamper", sizes: [["1 hamper", 1499]], shape: "box" },
        ],
      },
      {
        slug: "chhath-essentials",
        name: "Chhath essentials",
        brands: ["Arghya", "Mithila Gold", "Champaran Harvest"],
        items: [
          { name: "Chhath pooja kit", sizes: [["1 kit", 499]], shape: "box" },
          { name: "Bamboo soop", sizes: [["1 piece", 150]], gstBps: 0, shape: "box" },
          { name: "Thekua ready mix", sizes: [["1 kg", 140]], shape: "pouch" },
          { name: "Prasad ghee", sizes: [["500 ml", 330]], shape: "jar" },
        ],
      },
      {
        slug: "winter-care",
        name: "Winter care",
        brands: ["WarmNest", "Bodhi Care", "Rajgir Naturals"],
        items: [
          { name: "Petroleum jelly", sizes: [["100 g", 85]], gstBps: 1800, shape: "jar" },
          { name: "Body lotion", sizes: [["400 ml", 299]], gstBps: 1800, shape: "bottle" },
          { name: "Lip balm", sizes: [["Pack of 2", 99]], gstBps: 1800, shape: "tube" },
          { name: "Mustard massage oil", sizes: [["200 ml", 120]], gstBps: 1800, shape: "bottle" },
        ],
      },
    ],
  },
];
