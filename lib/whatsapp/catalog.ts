// Single source of truth for what the bot can quote. The catalog block and the pricing
// rules in the system prompt are rendered from this file, so they can't drift apart.
// Note: the package cards on the site (locales/es.ts, locales/en.ts) still duplicate
// these prices; a follow-up PR wires them to this file.

/** The only email the bot may ever give to a client. */
export const CONTACT_EMAIL = "hire@davidsaenz.dev";

export type PackageId = "starter" | "automation" | "mvp";

export type Package = {
  id: PackageId;
  name: string;
  priceUsd: number;
  /** true → the price is a floor ("from $X") and the final price depends on scope. */
  startingPrice: boolean;
  timeline: string;
  popular: boolean;
  forWho: string;
  includes: readonly string[];
};

export const PACKAGES: readonly Package[] = [
  {
    id: "starter",
    name: "Starter — AI Chatbot",
    priceUsd: 300,
    startingPrice: false,
    timeline: "5 days",
    popular: false,
    forWho: "Businesses losing customers because they reply too slowly.",
    includes: [
      "Training on the business's own information",
      "Website or WhatsApp integration",
      "Up to 5 conversation flows",
      "Optional monthly maintenance",
    ],
  },
  {
    id: "automation",
    name: "AI Automation",
    priceUsd: 500,
    startingPrice: false,
    timeline: "7–10 days",
    popular: true,
    forWho: "Teams stuck with a repetitive manual process.",
    includes: [
      "One process automated end to end",
      "Integration with the tools they already use",
      "Documentation",
    ],
  },
  {
    id: "mvp",
    name: "AI MVP Sprint",
    priceUsd: 1200,
    startingPrice: true,
    timeline: "2–3 weeks",
    popular: false,
    forWho: "Founders who want to validate an idea.",
    includes: ["A working MVP", "Integrated AI", "Authentication", "Deployment"],
  },
];

/** Values of save_lead's `interest` field: one per package, plus "custom" for anything else. */
export const LEAD_INTERESTS = ["starter", "automation", "mvp", "custom"] as const;
export type LeadInterest = (typeof LEAD_INTERESTS)[number];

export function formatPrice(pkg: Package): string {
  const amount = `$${pkg.priceUsd.toLocaleString("en-US")} USD`;
  return pkg.startingPrice ? `from ${amount}` : amount;
}

/** Package list for the system prompt. */
export function renderCatalogBlock(): string {
  return PACKAGES.map((p) => {
    const popular = p.popular ? " (most popular)" : "";
    const scopeNote = p.startingPrice ? " (final price depends on scope)" : "";
    return [
      `- *${p.name}*${popular}: ${formatPrice(p)}${scopeNote} · ${p.timeline}`,
      `  For: ${p.forWho}`,
      `  Includes: ${p.includes.join("; ")}.`,
    ].join("\n");
  }).join("\n");
}

/** Pricing guardrails for the system prompt, built from the same data as the catalog. */
export function renderPricingRules(): string {
  const allowed = PACKAGES.map((p) => `${p.name} = ${formatPrice(p)}`).join("; ");
  const startingRules = PACKAGES.filter((p) => p.startingPrice).map(
    (p) =>
      `- Always present ${p.name} as "${formatPrice(p)} — the final price depends on scope". Never state it as a flat price. Its starting price is fixed too: the final price depends only on scope, never on negotiation.`,
  );
  return [
    "Pricing rules (strict, no exceptions):",
    `- The ONLY prices you may ever state are exactly these: ${allowed}. Prices are in USD; never convert currencies or state any other number.`,
    ...startingRules,
    "- For anything outside these packages (custom projects, extra features, add-ons like monthly maintenance, larger scopes, combinations, hourly work), do NOT give any number: no estimates, ranges, ballparks, or \"around X\". Say David quotes it based on scope, and collect their details so he can follow up.",
    "- Catalog prices are fixed. Never negotiate, discount, or haggle, and don't offer deals, payment plans, or lower prices. If they ask for a discount or push back on price, say the catalog prices are fixed (in Spanish: \"los precios del catálogo son fijos\") and move on. Never say or imply that David confirms, reviews, or adjusts the price of a catalog package: that sounds negotiable.",
    "- Timelines: only the estimates listed above. Never promise specific delivery dates.",
  ].join("\n");
}
