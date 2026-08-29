"use client";

import {
  familyOfTag,
  profileConfigV1,
  type PlayerProfile,
  type ProfileTag,
} from "../../../lib/player-profile";

const DOMAIN_IDS = ["reaction", "flexibility", "inhibition", "attention", "controller"] as const;

const DOMAIN_SHORT_LABEL: Record<string, string> = {
  reaction: "SRT",
  flexibility: "TS",
  inhibition: "GNG",
  attention: "Posner",
  controller: "Controller",
};

export interface ProfileInspectorProps {
  profile: PlayerProfile;
}

function allTags(profile: PlayerProfile): ProfileTag[] {
  return profile.domains.flatMap((d) => d.facets.flatMap((f) => f.tags));
}

/** Collapsible dev-only panel exposing the full reasoning pipeline. */
export function ProfileInspector({ profile }: ProfileInspectorProps) {
  const tags = allTags(profile);
  const activeDomains = new Set(profile.domains.map((d) => d.domain));

  return (
    <details className="profile-inspector">
      <summary className="profile-inspector__summary">
        <span className="profile-inspector__badge">DEV</span>
        Profile Inspector
      </summary>

      <div className="profile-inspector__body">
        <dl className="profile-inspector__meta">
          <div>
            <dt>Engine</dt>
            <dd>{profile.engineVersion}</dd>
          </div>
          <div>
            <dt>Thresholds</dt>
            <dd>{profile.thresholdVersion}</dd>
          </div>
          <div>
            <dt>Archetype</dt>
            <dd>{profile.archetype?.label ?? "None"}</dd>
          </div>
          <div>
            <dt>Archetype score</dt>
            <dd>{profile.archetype ? profile.archetype.score.toFixed(3) : "—"}</dd>
          </div>
        </dl>

        <section className="profile-inspector__section">
          <h4>Coverage</h4>
          <ul className="profile-inspector__coverage">
            {DOMAIN_IDS.map((id) => (
              <li
                className={
                  activeDomains.has(id)
                    ? "profile-inspector__coverage-on"
                    : "profile-inspector__coverage-off"
                }
                key={id}
              >
                {activeDomains.has(id) ? "✓" : "–"} {DOMAIN_SHORT_LABEL[id]}
              </li>
            ))}
          </ul>
        </section>

        <section className="profile-inspector__section">
          <h4>Features ({profile.features.length})</h4>
          <ul className="profile-inspector__list">
            {profile.features.map((f) => (
              <li key={f.id}>
                <code>{f.id}</code> = {f.value}
                <span className="profile-inspector__unit">({f.unit})</span>
              </li>
            ))}
            {profile.features.length === 0 && <li className="profile-inspector__empty">No features derived.</li>}
          </ul>
        </section>

        <section className="profile-inspector__section">
          <h4>Selected tags ({tags.length})</h4>
          <ul className="profile-inspector__list">
            {tags.map((tag) => {
              const family = familyOfTag(tag, profileConfigV1);
              return (
                <li key={tag.id}>
                  <code>{tag.label}</code>
                  <span className="profile-inspector__unit">
                    {tag.priority} · {tag.strength.toFixed(2)} · {tag.domain}
                    {family ? ` · ${family.label}` : ""}
                  </span>
                </li>
              );
            })}
            {tags.length === 0 && <li className="profile-inspector__empty">No tags selected.</li>}
          </ul>
        </section>

        {profile.warnings.length > 0 && (
          <section className="profile-inspector__section">
            <h4>Warnings ({profile.warnings.length})</h4>
            <ul className="profile-inspector__list">
              {profile.warnings.map((w, i) => (
                <li className="profile-inspector__warning" key={i}>
                  <code>{w.code}</code>
                  {w.path && <span className="profile-inspector__unit">[{w.path}]</span>}
                  <span className="profile-inspector__warning-msg">{w.message}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="profile-inspector__section">
          <h4>Sunburst JSON</h4>
          <pre className="profile-inspector__pre">
            {JSON.stringify(profile.sunburst, null, 2)}
          </pre>
        </section>
      </div>
    </details>
  );
}
