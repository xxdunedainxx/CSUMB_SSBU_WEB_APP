"use client";

import type { PlayerProfile } from "../../../lib/player-profile";

export interface ProfileArchetypeProps {
  profile: PlayerProfile;
}

const BALANCED_COPY =
  "No single archetype clearly leads — your profile is balanced across patterns.";

/**
 * Archetype summary above the sunburst card, driven by engine classification.
 */
export function ProfileArchetype({ profile }: ProfileArchetypeProps) {
  const label = profile.archetype?.label ?? "Balanced Profile";

  return (
    <section className="profile-archetype" aria-labelledby="profile-archetype-heading">
      <h2 className="profile-archetype__heading" id="profile-archetype-heading">
        What archetype best describes you from the test results?
      </h2>
      <div className="profile-archetype__body">
        <span className="profile-archetype-badge">{label}</span>
        {profile.archetype ? (
          <p className="profile-archetype-desc">{profile.archetype.description}</p>
        ) : (
          <p className="profile-archetype-desc profile-archetype-desc--balanced">
            {BALANCED_COPY}
          </p>
        )}
      </div>
    </section>
  );
}
