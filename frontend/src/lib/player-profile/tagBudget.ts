import type { GlobalArchetype, ProfileTag, RuleContext } from "./types";

/**
 * Extra score for each priority tier. Core traits anchor the profile, so they
 * win ties against weaker supporting/secondary tags.
 */
const PRIORITY_BONUS: Record<ProfileTag["priority"], number> = {
  core: 0.25,
  supporting: 0.12,
  secondary: 0,
};

function score(tag: ProfileTag): number {
  return tag.strength + PRIORITY_BONUS[tag.priority];
}

const DOMAIN_ORDER: Record<string, number> = {
  reaction: 0,
  flexibility: 1,
  inhibition: 2,
  attention: 3,
  controller: 4,
};

/** Deterministic ordering: domain order, then facet, then strength desc. */
function sortTags(tags: ProfileTag[]): ProfileTag[] {
  return [...tags].sort((a, b) => {
    const d = (DOMAIN_ORDER[a.domain] ?? 9) - (DOMAIN_ORDER[b.domain] ?? 9);
    if (d !== 0) return d;
    const f = a.facet.localeCompare(b.facet);
    if (f !== 0) return f;
    return b.strength - a.strength;
  });
}

/**
 * Hard per-profile tag budget. The full rule library stays intact — this only
 * trims the emitted set for one JSON results object to
 * `config.tagFilters.maxTags` total tags, across all domains.
 *
 * Reservations keep the profile legible and stable:
 *  1. Every tag named by the archetype's evidence list.
 *  2. The highest-scored tag of each active domain (no test vanishes).
 * The remaining budget fills by score (strength + priority bonus), strongest
 * first. Deterministic: tie order follows the resolved tag ordering.
 */
export function applyTagBudget(
  tags: ProfileTag[],
  archetype: GlobalArchetype | null,
  config: RuleContext["config"]
): ProfileTag[] {
  const maxTags = config.tagFilters.maxTags;
  if (tags.length <= maxTags) return tags;

  const scored = tags.map((t) => ({ tag: t, score: score(t) }));
  const selected = new Map<string, ProfileTag>();

  // 1. Archetype evidence tags — keeps the detected archetype visible.
  if (archetype) {
    const evidenceLabels = new Set(archetype.evidenceTags);
    for (const t of tags) {
      if (evidenceLabels.has(t.label)) {
        selected.set(t.id, t);
      }
    }
  }

  // 2. Highest-scored tag per active domain — no domain collapses out of view.
  const domainTop = new Map<string, ProfileTag>();
  for (const t of tags) {
    const current = domainTop.get(t.domain);
    if (!current || score(t) > score(current)) {
      domainTop.set(t.domain, t);
    }
  }
  for (const t of domainTop.values()) {
    selected.set(t.id, t);
  }

  // 3. Fill the remaining budget by score, strongest first.
  const remaining = scored
    .filter(({ tag }) => !selected.has(tag.id))
    .sort((a, b) => b.score - a.score);
  for (const { tag } of remaining) {
    if (selected.size >= maxTags) break;
    selected.set(tag.id, tag);
  }

  // Defensive: if reservations alone exceed the budget, keep the strongest.
  if (selected.size > maxTags) {
    const trimmed = [...selected.values()]
      .sort((a, b) => score(b) - score(a))
      .slice(0, maxTags);
    selected.clear();
    for (const t of trimmed) {
      selected.set(t.id, t);
    }
  }

  return sortTags([...selected.values()]);
}
