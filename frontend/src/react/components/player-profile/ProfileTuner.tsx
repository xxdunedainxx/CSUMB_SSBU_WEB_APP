"use client";

import { useId } from "react";
import { ALL_FIXTURES, type NamedFixture } from "../../../lib/player-profile/__tests__/fixtures/fixtures";

export interface ProfileTunerProps {
  value: string;
  onChange: (fixture: NamedFixture) => void;
}

/**
 * Demo-session picker. Swapping the fixture rebuilds the player profile via
 * the engine, which changes the sunburst silhouette. Backed by the engine's
 * deterministic fixtures until real aggregate results are available.
 */
export function ProfileTuner({ value, onChange }: ProfileTunerProps) {
  const selectId = useId();
  const selected = ALL_FIXTURES.find((f) => f.id === value);

  return (
    <div className="profile-tuner">
      <label className="profile-tuner__label" htmlFor={selectId}>
        Demo session
      </label>
      <select
        className="profile-tuner__select"
        id={selectId}
        onChange={(event) => {
          const fixture = ALL_FIXTURES.find((f) => f.id === event.target.value);
          if (fixture) onChange(fixture);
        }}
        value={value}
      >
        {ALL_FIXTURES.map((fixture) => (
          <option key={fixture.id} value={fixture.id}>
            {fixture.label}
          </option>
        ))}
      </select>
      {selected && (
        <p className="profile-tuner__description">{selected.description}</p>
      )}
    </div>
  );
}
