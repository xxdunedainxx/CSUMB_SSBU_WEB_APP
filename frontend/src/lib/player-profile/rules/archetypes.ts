import type { DomainId, GlobalArchetype, ProfileTag } from "../types";

export interface ArchetypeDefinition {
  id: string;
  label: string;
  description: string;
  tagIds: string[];
  /**
   * Domains the archetype's evidence tags come from. The sunburst deepens
   * these branches (archetype-emphasized depth), giving each archetype a
   * distinct silhouette while per-player results still vary the shape.
   */
  domains: DomainId[];
}

/**
 * Small archetype library. An archetype wins when its average evidence-tag
 * strength is >= minScore and leads the next-best archetype by >= minLead;
 * otherwise the profile is "Balanced" (UI falls back to a Balanced badge).
 */
export const ARCHETYPE_DEFINITIONS: ArchetypeDefinition[] = [
  {
    id: "rapid-adapter",
    label: "Rapid Adapter",
    description:
      "Warms up fast and adapts quickly across sessions — gains appear in reaction, task switching, and cue handling.",
    tagIds: ["fast-warm-up", "full-warm-up", "adapt-rapid", "cue-adapt-quick"],
    domains: ["reaction", "flexibility", "attention"],
  },
  {
    id: "precision-anchor",
    label: "Precision Anchor",
    description:
      "Control quality comes first — tight stick placement and accuracy hold steady even under pressure.",
    tagIds: ["center-locked", "precision-biased", "accuracy-holding", "dual-precision-preserving", "balanced-sticks"],
    domains: ["controller", "attention"],
  },
  {
    id: "flow-operator",
    label: "Flow Operator",
    description:
      "Task changes barely register — low switch and mix costs with smooth dual-stick coordination.",
    tagIds: ["fluid-switcher", "mix-fluid-switcher", "flow-switcher", "dual-coordinator", "balanced-dual-load"],
    domains: ["flexibility", "controller"],
  },
  {
    id: "controlled-speed",
    label: "Controlled Speed",
    description:
      "Gains speed without losing control — acceleration arrives with stable or improving accuracy.",
    tagIds: ["gng-controlled-acceleration", "gng-restraint-calibration", "gng-cleaner-control", "gng-tempo-stable"],
    domains: ["inhibition"],
  },
];

const MIN_SCORE = 0.65;
const MIN_LEAD = 0.1;

/** Domains an archetype emphasizes (deepened in the sunburst). Empty when no archetype. */
export function archetypeDomainEmphasis(
  archetype: GlobalArchetype | null
): ReadonlySet<DomainId> {
  if (!archetype) return new Set();
  const def = ARCHETYPE_DEFINITIONS.find((d) => d.id === archetype.id);
  return new Set(def?.domains ?? []);
}

export function deriveArchetype(tags: ProfileTag[]): GlobalArchetype | null {
  const byId = new Map(tags.map((tag) => [tag.id, tag]));

  const scored = ARCHETYPE_DEFINITIONS.map((def) => {
    const matched = def.tagIds
      .map((id) => byId.get(id))
      .filter((tag): tag is ProfileTag => tag !== undefined);
    const score = matched.length === 0 ? 0 : matched.reduce((s, t) => s + t.strength, 0) / matched.length;
    return {
      def,
      score,
      matched,
    };
  }).filter((entry) => entry.score > 0);

  if (scored.length === 0) return null;
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const second = sorted[1];

  if (top.score < MIN_SCORE) return null;
  if (second && top.score - second.score < MIN_LEAD) return null;

  return {
    id: top.def.id,
    label: top.def.label,
    score: top.score,
    description: top.def.description,
    evidenceTags: top.matched.map((t) => t.label),
  };
}
