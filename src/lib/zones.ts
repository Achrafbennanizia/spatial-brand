export type ZoneId = "hub" | "product" | "story" | "customers" | "careers";

export type Zone = {
  id: ZoneId;
  label: string;
  short: string;
  eyebrow: string;
  title: string;
  body: string;
  points: { label: string; value: string }[];
  cta: { label: string; href: string };
  position: [number, number, number];
  camera: [number, number, number];
};

/**
 * Dixor spatial funnel — proof-led creative agency.
 * Industry facts from AgencyAnalytics, Design Business Council,
 * Predictable Profits, Promethean Research (see docs/marketing.md).
 */
export const ZONES: Zone[] = [
  {
    id: "hub",
    label: "Studio",
    short: "00",
    eyebrow: "DIXOR CREATIVE",
    title: "Creative work CFOs can defend.",
    body: "77% of clients now expect creative to prove ROI — not just look sharp. Dixor is a proof-led studio: four rooms that show the offer, the cases, the retention model, and the team who ships it.",
    points: [
      { label: "Market", value: "77% demand creative ROI proof" },
      { label: "Method", value: "Situation → craft → metric" },
      { label: "Nav", value: "Scroll the funnel · swipe on mobile" },
    ],
    cta: { label: "See the offer", href: "#product" },
    position: [0, 0.2, 0],
    camera: [0, 5.6, 12.5],
  },
  {
    id: "product",
    label: "Services",
    short: "01",
    eyebrow: "WHAT WE SELL",
    title: "Brand, product, and launches built to convert.",
    body: "75% of agency clients run conversion-driven work — and demand for branding, content, and design is rising. We ship systems your team can operate: identity, UI, and launch sites with a clear success metric from day one.",
    points: [
      { label: "Brand", value: "Identity systems buyers remember" },
      { label: "Product", value: "UI that shortens the path to yes" },
      { label: "Launch", value: "Sites tied to a conversion KPI" },
    ],
    cta: {
      label: "Start a project",
      href: "mailto:hello@dixor.studio?subject=Dixor%20project%20brief",
    },
    position: [4.2, 0.35, 0],
    camera: [7.6, 3.4, 5.0],
  },
  {
    id: "story",
    label: "Work",
    short: "02",
    eyebrow: "PROOF BEFORE THE PITCH",
    title: "Case work with proof, not mood boards.",
    body: "Buyers look for evidence-backed cases before they call. Flip the boards: each card states the constraint, the creative decision, and the metric that moved — the format B2B committees can forward internally.",
    points: [
      { label: "Format", value: "Constraint · decision · result" },
      { label: "Win rate", value: "Understanding needs early wins 56%" },
      { label: "Use", value: "Shareable proof for budget owners" },
    ],
    cta: {
      label: "Request case deck",
      href: "mailto:hello@dixor.studio?subject=Dixor%20case%20deck",
    },
    position: [0, 0.35, -4.2],
    camera: [0, 3.2, -8.4],
  },
  {
    id: "customers",
    label: "Clients",
    short: "03",
    eyebrow: "WHY PARTNERS STAY",
    title: "Retention is the growth engine.",
    body: "Top agencies keep ~92% of clients yearly; typical partnerships last 2–5 years. 81% say relationships retain accounts — and 70% call reporting essential. We build creative retainers around clarity, cadence, and visible results.",
    points: [
      { label: "Benchmark", value: "~92% retention at top agencies" },
      { label: "Tenure", value: "Partners often stay 2–5 years" },
      { label: "Operating", value: "Transparent reporting every sprint" },
    ],
    cta: {
      label: "Talk retainers",
      href: "mailto:hello@dixor.studio?subject=Dixor%20retainer",
    },
    position: [-4.2, 0.35, 0],
    camera: [-7.6, 3.4, 5.0],
  },
  {
    id: "careers",
    label: "Team",
    short: "04",
    eyebrow: "WHO SHIPS THE PROOF",
    title: "Taste, judgment, and reporting discipline.",
    body: "Relationships retain clients — but only if the work ships and the numbers are honest. We hire designers, engineers, and producers who critique in public, hit sprint dates, and write the result line before the case deck.",
    points: [
      { label: "Roles", value: "Design · Eng · Producer" },
      { label: "Bar", value: "Shipped work + metric literacy" },
      { label: "Setup", value: "Remote-first · EU / US hubs" },
    ],
    cta: {
      label: "Apply with work",
      href: "mailto:careers@dixor.studio?subject=Dixor%20application",
    },
    position: [0, 0.35, 4.2],
    camera: [0, 3.4, 8.6],
  },
];

export function getZone(id: ZoneId) {
  return ZONES.find((z) => z.id === id) ?? ZONES[0];
}

export const NAV_ZONES = ZONES.filter((z) => z.id !== "hub");
