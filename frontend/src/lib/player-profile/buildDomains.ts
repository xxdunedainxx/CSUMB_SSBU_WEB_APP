import type {
  DomainId,
  DomainProfile,
  FacetProfile,
  GlobalArchetype,
  ProfileTag,
  RuleContext,
} from "./types";
import { archetypeDomainEmphasis } from "./rules/archetypes";

export const DOMAIN_LABELS: Record<DomainId, string> = {
  reaction: "Reaction",
  flexibility: "Flexibility",
  inhibition: "Inhibition",
  attention: "Attention",
  controller: "Controller",
};

const DOMAIN_ORDER: DomainId[] = ["reaction", "flexibility", "inhibition", "attention", "controller"];

/** visualExpression = strengthBaseline + strength * strengthMultiplier */
export function visualExpression(strength: number, config: RuleContext["config"]): number {
  return config.visual.strengthBaseline + strength * config.visual.strengthMultiplier;
}

export interface DomainsResult {
  domains: DomainProfile[];
  /**
   * tag id -> visual leaf value within its domain budget (for the sunburst).
   * Covers only each facet's prominent `visibleTags` subset.
   */
  leafWeights: Map<string, number>;
}

/**
 * Depth threshold for a domain's branches. Archetype-emphasized domains expand
 * at a much lower bar so the player's archetype shapes the silhouette;
 * everything else needs a genuinely strong signature to expand.
 */
export function effectiveDepthAt(
  domain: DomainId,
  archetype: GlobalArchetype | null,
  config: RuleContext["config"]
): number {
  const { depthAt, archetypeBoost } = config.visual.depth;
  return archetypeDomainEmphasis(archetype).has(domain)
    ? depthAt * archetypeBoost
    : depthAt;
}

/**
 * Prominence tier for how many tag children a facet emits in the sunburst.
 * A facet whose strongest tag barely fires collapses to a single wedge; a
 * facet with a very strong signature fans out to up to `maxChildren`. Returns
 * 0 when the top tag is below the branch's depth threshold, so the facet
 * renders as a bare wedge.
 */
export function facetChildLimit(
  topStrength: number,
  depthAt: number,
  config: RuleContext["config"]
): number {
  const { twoAt, threeAt, maxChildren } = config.visual.childCount;
  if (topStrength < depthAt) return 0;
  if (topStrength >= threeAt) return maxChildren;
  if (topStrength >= twoAt) return 2;
  return 1;
}

/**
 * Whether a domain's strongest tag meets its branch depth threshold, so its
 * facets render as inner rings. A collapsed domain renders as a single wedge.
 */
export function domainExpands(
  topStrength: number,
  depthAt: number
): boolean {
  return topStrength >= depthAt;
}

/**
 * Groups resolved tags into per-domain facet profiles. Each active domain
 * receives a budget of exactly `domainBudget` (100) units, distributed across
 * its active facets by (base weight x visual expression) and normalized.
 * Facet units are then split across the facet's tags by relative expression,
 * so a facet with several strong tags still sums to its facet weight.
 */
export function buildDomains(
  tags: ProfileTag[],
  config: RuleContext["config"],
  archetype: GlobalArchetype | null = null
): DomainsResult {
  const byDomain = new Map<DomainId, ProfileTag[]>();
  for (const tag of tags) {
    const list = byDomain.get(tag.domain) ?? [];
    list.push(tag);
    byDomain.set(tag.domain, list);
  }

  const leafWeights = new Map<string, number>();
  const domains: DomainProfile[] = [];
  for (const domain of DOMAIN_ORDER) {
    const domainTags = byDomain.get(domain);
    if (!domainTags?.length) continue;

    const baseWeights = config.facetBaseWeights[domain] ?? {};
    const domainDepthAt = effectiveDepthAt(domain, archetype, config);

    const byFacet = new Map<string, ProfileTag[]>();
    for (const tag of domainTags) {
      const list = byFacet.get(tag.facet) ?? [];
      list.push(tag);
      byFacet.set(tag.facet, list);
    }

    const rawWeights = new Map<string, number>();
    for (const [facet, facetTags] of byFacet) {
      const facetStrength = Math.max(...facetTags.map((t) => t.strength));
      const base = baseWeights[facet] ?? 0.2;
      rawWeights.set(facet, base * visualExpression(facetStrength, config));
    }

    const rawTotal = [...rawWeights.values()].reduce((s, v) => s + v, 0);
    const facets: FacetProfile[] = [];
    for (const [facet, facetTags] of byFacet) {
      const raw = rawWeights.get(facet) ?? 0;
      const facetWeight = rawTotal > 0 ? (raw / rawTotal) * config.domainBudget : 0;

      // Split the facet's units across its prominent tags by relative
      // expression, renormalized so the visible subset sums to the facet weight.
      const sortedTags = [...facetTags].sort((a, b) => b.strength - a.strength);
      const topStrength = sortedTags[0]?.strength ?? 0;
      const childLimit = Math.min(
        facetChildLimit(topStrength, domainDepthAt, config),
        sortedTags.length
      );
      const visibleTags = sortedTags.slice(0, childLimit);

      const expressions = visibleTags.map((t) => ({
        tag: t,
        expression: visualExpression(t.strength, config),
      }));
      const expressionTotal = expressions.reduce((s, e) => s + e.expression, 0);
      for (const e of expressions) {
        leafWeights.set(
          e.tag.id,
          expressionTotal > 0 ? (e.expression / expressionTotal) * facetWeight : 0
        );
      }

      facets.push({
        facet,
        weight: facetWeight,
        tags: sortedTags,
        visibleTags,
      });
    }

    facets.sort((a, b) => b.weight - a.weight);

    const domainTopStrength = Math.max(...domainTags.map((t) => t.strength));

    domains.push({
      domain,
      label: DOMAIN_LABELS[domain],
      totalWeight: config.domainBudget,
      expandsToFacets: domainExpands(domainTopStrength, domainDepthAt),
      facets,
    });
  }

  return { domains, leafWeights };
}
