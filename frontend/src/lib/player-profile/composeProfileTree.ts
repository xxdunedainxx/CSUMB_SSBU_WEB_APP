import type {
  DomainId,
  GlobalArchetype,
  ProfileConfig,
  ProfileTag,
  SignatureFamily,
  SunburstNode,
} from "./types";
import { visualExpression } from "./buildDomains";

/**
 * Extra score for each priority tier, mirroring tagBudget. Core traits anchor
 * a branch, so they win tie-breaks against weaker supporting/secondary tags.
 */
const PRIORITY_BONUS: Record<ProfileTag["priority"], number> = {
  core: 0.25,
  supporting: 0.12,
  secondary: 0,
};

function score(tag: ProfileTag): number {
  return tag.strength + PRIORITY_BONUS[tag.priority];
}

/** Defensive fallback when a facet is missing from the family map. */
const DOMAIN_FALLBACK_FAMILY: Record<DomainId, string> = {
  reaction: "adaptive-core",
  flexibility: "flexible-load",
  inhibition: "tempo-control",
  attention: "cue-control",
  controller: "motor-precision",
};

const FAMILY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * Signature-chain sunburst composer.
 *
 * Replaces the fixed domain -> facet -> tag fan-out (which rendered every
 * facet as a labeled arc and could reach 16+ wedges) with 2-4 signature
 * branches, each a composite-head tag with refinement siblings. Total visible
 * arcs (branches + tags) never exceed `visual.maxArcs`.
 *
 * Determinism: same input + config always produces the same tree. Every branch
 * keeps its strongest tag, archetype evidence tags stay visible, and a tag that
 * is the only representative of its domain is reserved so no completed test
 * vanishes. The full per-facet tag detail stays available on `profile.domains`
 * (header chips / inspector).
 */
export function composeProfileTree(
  tags: ProfileTag[],
  archetype: GlobalArchetype | null,
  config: ProfileConfig
): SunburstNode {
  const root: SunburstNode = { name: "Player Profile", children: [] };
  if (tags.length === 0) return root;

  const families = config.visual.signatureFamilies;
  const { maxArcs, maxBranches, maxSiblings } = config.visual;

  const familyByFacet = new Map<string, string>();
  for (const family of families) {
    for (const ref of family.facets) {
      familyByFacet.set(`${ref.domain}|${ref.facet}`, family.id);
    }
  }

  const familyIdOf = (tag: ProfileTag): string | null =>
    familyByFacet.get(`${tag.domain}|${tag.facet}`) ??
    DOMAIN_FALLBACK_FAMILY[tag.domain] ??
    null;

  const byFamily = new Map<string, ProfileTag[]>();
  for (const tag of tags) {
    const familyId = familyIdOf(tag);
    if (!familyId) continue;
    const list = byFamily.get(familyId) ?? [];
    list.push(tag);
    byFamily.set(familyId, list);
  }

  // 1. Score each family by its strongest tag; archetype evidence tags boost
  //    their family so the detected archetype always shapes the silhouette.
  const evidenceLabels = new Set(archetype?.evidenceTags ?? []);
  const familyTop = new Map<string, ProfileTag>();
  const familyScore = new Map<string, number>();
  for (const [familyId, familyTags] of byFamily) {
    const sorted = [...familyTags].sort((a, b) => b.strength - a.strength);
    const top = sorted[0];
    familyTop.set(familyId, top);
    const hasEvidence = familyTags.some((t) => evidenceLabels.has(t.label));
    familyScore.set(familyId, top.strength + (hasEvidence ? 1 : 0));
  }

  // 2. Select branches — archetype-evidence families first, then by score.
  const selected: string[] = [];
  const ordered = [...familyScore.entries()].sort((a, b) => b[1] - a[1]);
  for (const [familyId] of ordered) {
    if (selected.length >= maxBranches) break;
    selected.push(familyId);
  }
  for (const [familyId, familyTags] of byFamily) {
    if (selected.length >= maxBranches) break;
    const hasEvidence = familyTags.some((t) => evidenceLabels.has(t.label));
    if (hasEvidence && !selected.includes(familyId)) {
      selected.push(familyId);
    }
  }
  if (selected.length === 0) return root;

  const selectedSet = new Set(selected);

  // 3. Tiered selection within a hard budget. Branch tops (tier 0) always win;
  //    archetype evidence tags (tier 1) and single-test representatives
  //    (tier 2) follow by score; everything else fills the remaining slots.
  //    Total arcs (branches + tags) never exceed maxArcs, and each branch can
  //    hold at most maxSiblings + 1 tags (head + refinements).
  const tierOf = new Map<string, number>();
  const markTier = (tag: ProfileTag, tier: number) => {
    const existing = tierOf.get(tag.id);
    if (existing === undefined || tier < existing) tierOf.set(tag.id, tier);
  };

  for (const familyId of selected) {
    const top = familyTop.get(familyId);
    if (top) markTier(top, 0);
  }
  for (const familyId of selected) {
    for (const tag of byFamily.get(familyId) ?? []) {
      if (evidenceLabels.has(tag.label)) markTier(tag, 1);
    }
  }
  const byDomain = new Map<string, ProfileTag[]>();
  for (const tag of tags) {
    const list = byDomain.get(tag.domain) ?? [];
    list.push(tag);
    byDomain.set(tag.domain, list);
  }
  for (const [, domainTags] of byDomain) {
    if (domainTags.length === 1) {
      const tag = domainTags[0];
      if (selectedSet.has(familyIdOf(tag) ?? "")) markTier(tag, 2);
    }
  }

  const candidates = tags
    .filter((t) => selectedSet.has(familyIdOf(t) ?? ""))
    .map((t) => ({
      tag: t,
      tier: tierOf.get(t.id) ?? 3,
      score: score(t),
    }))
    .sort((a, b) => a.tier - b.tier || b.score - a.score);

  const visible = new Map<string, ProfileTag>();
  const branchSlots = new Map<string, number>();
  for (const familyId of selected) {
    branchSlots.set(familyId, maxSiblings + 1);
  }

  const totalTagSlots = maxArcs - selected.length;
  for (const { tag } of candidates) {
    if (visible.size >= totalTagSlots) break;
    const familyId = familyIdOf(tag)!;
    const slots = branchSlots.get(familyId) ?? 0;
    if (slots <= 0) continue;
    visible.set(tag.id, tag);
    branchSlots.set(familyId, slots - 1);
  }

  // 4. Defensive guard: the tiered loop already bounds arcs, but never emit
  //    beyond maxArcs even if config changes make slots negative.
  if (selected.length + visible.size > maxArcs) {
    const extras = [...visible.values()]
      .sort((a, b) => score(a) - score(b))
      .slice(0, selected.length + visible.size - maxArcs);
    for (const tag of extras) {
      visible.delete(tag.id);
    }
  }

  // 6. Compose: branch -> composite head -> refinement siblings.
  const familyById = new Map(families.map((f) => [f.id, f]));
  const branchIndex = new Map(
    selected.map((familyId, index) => [familyId, index])
  );

  for (const familyId of selected) {
    const family: SignatureFamily | undefined = familyById.get(familyId);
    const branchTags = [...visible.values()]
      .filter((t) => familyIdOf(t) === familyId)
      .sort((a, b) => b.strength - a.strength);
    if (branchTags.length === 0) continue;

    const color = FAMILY_COLORS[(branchIndex.get(familyId) ?? 0) % FAMILY_COLORS.length];
    const branchNode: SunburstNode = {
      name: family?.label ?? familyId,
      color,
      children: [],
    };

    const head = branchTags[0];
    const refinements = branchTags.slice(1, maxSiblings + 1);
    if (refinements.length === 0) {
      branchNode.children!.push({
        name: head.label,
        value: visualExpression(head.strength, config),
      });
    } else {
      const headNode: SunburstNode = {
        name: head.label,
        children: refinements.map((ref) => ({
          name: ref.label,
          value: visualExpression(ref.strength, config),
        })),
      };
      branchNode.children!.push(headNode);
    }

    root.children!.push(branchNode);
  }

  return root;
}

/** Resolve the signature family a tag belongs to (used by the inspector). */
export function familyOfTag(
  tag: Pick<ProfileTag, "domain" | "facet">,
  config: ProfileConfig
): SignatureFamily | null {
  for (const family of config.visual.signatureFamilies) {
    if (
      family.facets.some(
        (ref) => ref.domain === tag.domain && ref.facet === tag.facet
      )
    ) {
      return family;
    }
  }
  const fallback = DOMAIN_FALLBACK_FAMILY[tag.domain];
  return config.visual.signatureFamilies.find((f) => f.id === fallback) ?? null;
}
