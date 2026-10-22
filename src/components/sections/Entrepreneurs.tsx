import type { CSSProperties } from "react";
import { Equal, Plus, Store, Users } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ENTREPRENEUR_MODEL } from "@/lib/constants";

/*
 * How the network adds up to roughly one lakh local entrepreneurs: a dealer
 * in every gram panchayat and two sub-dealers in every village. Behind it,
 * Bihar drawn as a floating board of dots: gold dots twinkle as partners,
 * a light sweeps across, and packets run from Patna out to the major cities.
 */

const { panchayats, dealersPerPanchayat, villages, subDealersPerVillage } = ENTREPRENEUR_MODEL;
const DEALERS = panchayats * dealersPerPanchayat;
const SUB_DEALERS = villages * subDealersPerVillage;
const TOTAL = DEALERS + SUB_DEALERS;

const fmt = (n: number) => n.toLocaleString("en-IN");

// ---- The map board -------------------------------------------------------

type LonLat = readonly [number, number];

// A rough outline of Bihar, clockwise from the north-west corner.
const OUTLINE: LonLat[] = [
  [83.95, 27.45], [84.6, 27.05], [85.2, 26.85], [85.9, 26.65], [86.6, 26.5], [87.2, 26.4],
  [87.9, 26.45], [88.15, 26.3], [88.0, 25.8], [87.8, 25.3], [87.2, 25.05], [86.5, 24.9],
  [86.0, 24.6], [85.5, 24.4], [84.9, 24.4], [84.3, 24.5], [83.8, 24.8], [83.4, 25.2],
  [83.6, 25.6], [84.1, 25.75], [84.3, 26.1], [84.0, 26.4], [83.9, 26.9],
];

const LON = [83.2, 88.3] as const;
const LAT = [24.2, 27.6] as const;

/** Lon/lat onto a board tilted away from the viewer: far rows are narrower. */
function project([lon, lat]: LonLat) {
  const u = (lon - LON[0]) / (LON[1] - LON[0]);
  const v = (LAT[1] - lat) / (LAT[1] - LAT[0]);
  const scale = 0.78 + 0.32 * v;
  return { x: 520 + (u - 0.5) * 880 * scale - v * 40, y: 70 + v * 420, scale };
}

function inside([lon, lat]: LonLat) {
  let hit = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Deterministic noise, so the server and client draw the same dots.
const noise = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const DOTS = (() => {
  const dots: { x: number; y: number; r: number; gold: boolean; delay: number; duration: number }[] = [];
  for (let lat = LAT[1]; lat >= LAT[0]; lat -= 0.085) {
    for (let lon = LON[0]; lon <= LON[1]; lon += 0.085) {
      if (!inside([lon, lat])) continue;
      const { x, y, scale } = project([lon, lat]);
      const n = noise(lon, lat);
      dots.push({ x, y, r: 2.4 * scale, gold: n > 0.9, delay: -n * 40, duration: 2.4 + noise(lat, lon) * 3 });
    }
  }
  return dots;
})();

const corner = (lon: number, lat: number) => project([lon, lat]);
const BOARD = [corner(LON[0], LAT[1]), corner(LON[1], LAT[1]), corner(LON[1], LAT[0]), corner(LON[0], LAT[0])];
const boardPath = (dy = 0) => BOARD.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y + dy}`).join(" ") + " Z";

interface City {
  name: string;
  at: LonLat;
  /** Which side of the dot the name sits on, to keep neighbours apart. */
  side?: "left" | "right";
}

const PATNA_AT: LonLat = [85.14, 25.61];

// Bihar's major cities and district towns.
const CITIES: City[] = [
  { name: "Raxaul", at: [84.85, 26.98] },
  { name: "Bettiah", at: [84.5, 26.8], side: "left" },
  { name: "Motihari", at: [84.92, 26.65] },
  { name: "Gopalganj", at: [84.43, 26.47], side: "left" },
  { name: "Sitamarhi", at: [85.49, 26.6] },
  { name: "Madhubani", at: [86.08, 26.35] },
  { name: "Siwan", at: [84.36, 26.22], side: "left" },
  { name: "Muzaffarpur", at: [85.39, 26.12], side: "left" },
  { name: "Darbhanga", at: [85.9, 26.15] },
  { name: "Supaul", at: [86.6, 26.12] },
  { name: "Araria", at: [87.47, 26.15], side: "left" },
  { name: "Kishanganj", at: [87.95, 26.1] },
  { name: "Chhapra", at: [84.73, 25.78], side: "left" },
  { name: "Samastipur", at: [85.78, 25.86] },
  { name: "Saharsa", at: [86.6, 25.88] },
  { name: "Purnia", at: [87.47, 25.78] },
  { name: "Buxar", at: [83.98, 25.56], side: "left" },
  { name: "Arrah", at: [84.66, 25.56], side: "left" },
  { name: "Katihar", at: [87.58, 25.54] },
  { name: "Begusarai", at: [86.13, 25.42], side: "left" },
  { name: "Munger", at: [86.47, 25.37] },
  { name: "Bhagalpur", at: [86.98, 25.25] },
  { name: "Jehanabad", at: [84.99, 25.21], side: "left" },
  { name: "Bihar Sharif", at: [85.52, 25.2] },
  { name: "Sasaram", at: [84.03, 24.95], side: "left" },
  { name: "Jamui", at: [86.22, 24.92] },
  { name: "Nawada", at: [85.54, 24.88] },
  { name: "Gaya", at: [85.0, 24.79], side: "left" },
  { name: "Aurangabad", at: [84.37, 24.75], side: "left" },
];

const PATNA = project(PATNA_AT);

// A gentle arc from Patna out to each city, lifted off the board.
const ROUTES = CITIES.map((city, i) => {
  const to = project(city.at);
  const dist = Math.hypot(to.x - PATNA.x, to.y - PATNA.y);
  const cx = (PATNA.x + to.x) / 2;
  const cy = (PATNA.y + to.y) / 2 - dist * 0.28;
  return {
    name: city.name,
    d: `M${PATNA.x},${PATNA.y} Q${cx},${cy} ${to.x},${to.y}`,
    duration: 2.6 + noise(i, dist) * 2.4,
    delay: -noise(dist, i) * 4,
  };
});

const BIHAR_TITLE = project([86.55, 27.25]);
const SWEEP_TOP = BOARD[0].y;
const SWEEP_HEIGHT = BOARD[2].y - BOARD[0].y;

function MapBoard() {
  return (
    <svg viewBox="20 40 1000 490" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="board-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1763" />
          <stop offset="1" stopColor="#4c1d80" />
        </linearGradient>
        <linearGradient id="board-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#de9beb" stopOpacity="0" />
          <stop offset="0.5" stopColor="#de9beb" stopOpacity="0.22" />
          <stop offset="1" stopColor="#de9beb" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="packet-glow">
          <stop offset="0" stopColor="#fff3d1" />
          <stop offset="0.4" stopColor="#ffc65c" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffc65c" stopOpacity="0" />
        </radialGradient>
        <clipPath id="board-clip">
          <path d={boardPath()} />
        </clipPath>
      </defs>

      {/* The slab: a darker lip under a lighter top */}
      <path d={boardPath(16)} fill="#1e0b33" />
      <path d={boardPath()} fill="url(#board-top)" stroke="#7a3fb8" strokeOpacity="0.5" />

      {/* A soft light sweeping across the board */}
      <g clipPath="url(#board-clip)" className="map-motion">
        <rect y={SWEEP_TOP} width="260" height={SWEEP_HEIGHT} fill="url(#board-sweep)" transform="skewX(-18)">
          <animate attributeName="x" from="-300" to="1300" dur="7s" repeatCount="indefinite" />
        </rect>
      </g>

      <text
        x={BIHAR_TITLE.x}
        y={BIHAR_TITLE.y}
        textAnchor="middle"
        fontSize="34"
        fontWeight="800"
        letterSpacing="12"
        fill="#f5edfb"
        fillOpacity="0.9"
        className="font-display"
      >
        BIHAR
      </text>
      <text
        x={BIHAR_TITLE.x}
        y={BIHAR_TITLE.y + 20}
        textAnchor="middle"
        fontSize="10"
        letterSpacing="2"
        fill="#de9beb"
      >
        38 DISTRICTS · {fmt(panchayats)} PANCHAYATS · {fmt(villages)} VILLAGES
      </text>

      {DOTS.filter((d) => !d.gold).map((d, i) => (
        <circle key={`p${i}`} cx={d.x} cy={d.y} r={d.r} fill="#8b5cc7" opacity="0.4" />
      ))}

      {/* Ripples spreading out from Patna across the board */}
      <g className="map-motion" fill="none" stroke="#ffc65c">
        {[0, 1.4, 2.8].map((begin) => (
          <ellipse key={begin} cx={PATNA.x} cy={PATNA.y} rx="0" ry="0" strokeWidth="1.2" opacity="0">
            <animate attributeName="rx" from="8" to="230" dur="4.2s" begin={`${begin}s`} repeatCount="indefinite" />
            <animate attributeName="ry" from="5" to="130" dur="4.2s" begin={`${begin}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.55" to="0" dur="4.2s" begin={`${begin}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
      </g>

      {/* Gold partner dots, each twinkling on its own beat */}
      {DOTS.filter((d) => d.gold).map((d, i) => (
        <g
          key={`g${i}`}
          className="map-twinkle"
          style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` } as CSSProperties}
        >
          <circle cx={d.x} cy={d.y} r={d.r * 3} fill="#ffc65c" opacity="0.18" />
          <circle cx={d.x} cy={d.y} r={d.r * 1.15} fill="#ffc65c" />
        </g>
      ))}

      {/* Routes from Patna, with packets running along them */}
      <g fill="none">
        {ROUTES.map((route) => (
          <path
            key={route.name}
            d={route.d}
            stroke="#ffc65c"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="2 5"
            className="map-route"
          />
        ))}
      </g>
      <g className="map-motion">
        {ROUTES.map((route) => (
          <circle key={route.name} r="4" fill="url(#packet-glow)">
            <animateMotion
              path={route.d}
              dur={`${route.duration}s`}
              begin={`${route.delay}s`}
              repeatCount="indefinite"
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          </circle>
        ))}
      </g>

      {CITIES.map((city, i) => {
        const { x, y } = project(city.at);
        const left = city.side === "left";
        return (
          <g key={city.name}>
            <circle
              cx={x}
              cy={y}
              r="6"
              fill="none"
              stroke="#de9beb"
              strokeOpacity="0.7"
              className="map-ping"
              style={{ animationDelay: `${-noise(i, 7) * 3}s` }}
            />
            <circle cx={x} cy={y} r="3" fill="#f0c2ff" />
            <text
              x={left ? x - 7 : x + 7}
              y={y + 3.5}
              textAnchor={left ? "end" : "start"}
              fontSize="10"
              fontWeight="600"
              fill="#efe4f8"
              stroke="#1a0b2c"
              strokeWidth="3"
              strokeOpacity="0.85"
              paintOrder="stroke"
            >
              {city.name}
            </text>
          </g>
        );
      })}

      {/* Patna, where the platform sits */}
      <g>
        <circle cx={PATNA.x} cy={PATNA.y} r="10" fill="none" stroke="#ffc65c" className="map-ping" />
        <circle cx={PATNA.x} cy={PATNA.y} r="5.5" fill="#ffc65c" />
        <text
          x={PATNA.x + 10}
          y={PATNA.y + 18}
          fontSize="12"
          fontWeight="800"
          fill="#ffc65c"
          stroke="#1a0b2c"
          strokeWidth="3"
          strokeOpacity="0.85"
          paintOrder="stroke"
        >
          Patna
        </text>
      </g>
    </svg>
  );
}

// ---- The section ---------------------------------------------------------

const TERMS = [
  {
    icon: Store,
    unit: "Gram panchayats",
    count: panchayats,
    rule: `× ${dealersPerPanchayat} dealer each`,
    result: DEALERS,
    role: "Panchayat dealers",
  },
  {
    icon: Users,
    unit: "Villages",
    count: villages,
    rule: `× ${subDealersPerVillage} sub-dealers each`,
    result: SUB_DEALERS,
    role: "Village sub-dealers",
  },
] as const;

export function Entrepreneurs() {
  return (
    <section
      id="entrepreneurs"
      className="ink band-ink relative scroll-mt-16 overflow-hidden py-16 sm:py-20"
      aria-labelledby="entrepreneurs-heading"
    >
      {/* The map board fills the band; the right side stays clear on wide screens */}
      <div className="absolute inset-0 opacity-40 lg:-right-16 lg:left-[36%] lg:opacity-100 mask-[linear-gradient(to_right,transparent,black_14%)]">
        <div className="map-float h-full w-full">
          <MapBoard />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#120a1e] via-[#120a1e]/80 to-transparent lg:via-[#120a1e]/40"
      />

      <Container className="relative">
        <div className="max-w-xl">
          <p className="eyebrow mb-3">Entrepreneurs across Bihar</p>
          <h2
            id="entrepreneurs-heading"
            className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            How Femxo builds <span className="text-gold">1 lakh</span> local entrepreneurs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            One dealer in every gram panchayat, two sub-dealers in every village. Each one runs a business of their
            own on the Femxo platform.
          </p>

          <ol className="mt-8 space-y-3">
            {TERMS.map(({ icon: Icon, unit, count, rule, result, role }, i) => (
              <li key={unit}>
                {i > 0 && (
                  <Plus size={16} aria-label="plus" className="mx-auto -mt-1 mb-2 text-gold sm:mx-0 sm:ml-5" />
                )}
                <div className="card-glass flex items-center gap-4 rounded-2xl p-4">
                  <span className="icon-tile">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-display font-bold">{fmt(count)}</span> {unit.toLowerCase()}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-highlight">{rule}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-gold sm:text-2xl">{fmt(result)}</p>
                    <p className="text-[11px] text-muted-foreground">{role}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <Equal size={16} aria-label="equals" className="mx-auto my-2 text-gold sm:mx-0 sm:ml-5" />

          <div className="flex items-end justify-between gap-4 rounded-2xl border border-gold-400/70 bg-gold-400/10 p-5 shadow-[0_0_40px_-12px_rgba(255,198,92,0.6)]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-highlight">Total entrepreneurs</p>
              <p className="font-display text-4xl font-bold text-gold sm:text-5xl">{fmt(TOTAL)}</p>
            </div>
            <p className="pb-1 text-right font-display text-lg font-semibold text-foreground">
              ≈ 1,00,000
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Panchayats: 8,072 in the 2021 Bihar panchayat elections (CAG audit report). Villages: 44,874 (Census
            2011). A long-term target, built in phases through local partners and verified demand.
          </p>
        </div>
      </Container>
    </section>
  );
}
