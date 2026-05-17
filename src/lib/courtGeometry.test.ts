import { describe, expect, it } from "vitest";
import { getBins } from "./courtGeometry";
import type { Shot } from "@/types/shots";

function makeShot(overrides: Partial<Shot> = {}): Shot {
  return {
    shooterId: "p1",
    shooterName: "Player 1",
    date: "2025-01-15",
    year: 2025,
    month: 1,
    day: 15,
    period: 1,
    startGameClock: 720,
    endGameClock: 700,
    shotClock: 12,
    x: -44,
    y: 0,
    outcome: false,
    passerX: null,
    passerY: null,
    assisted: false,
    assistOpportunity: false,
    blocked: false,
    fouled: false,
    shotType: "heave",
    complexShotType: "heave",
    contested: false,
    contestLevel: "uncontested",
    catchAndShoot: false,
    dribblesBefore: 0,
    zone: "backcourt",
    distance: 58,
    shotValue: 3,
    shotClockBucket: "end",
    dribbleBucket: "0",
    ...overrides,
  };
}

describe("getBins", () => {
  it("groups backcourt shots into one visible edge marker", () => {
    const bins = getBins([
      makeShot({ x: 10, y: -5 }),
      makeShot({ x: 25, y: 8 }),
      makeShot({ x: -44, y: 0, zone: "rim", shotType: "layup", complexShotType: "drivingLayup", distance: 3, shotValue: 2 }),
    ]);

    const backcourt = bins.find((bin) => bin.marker === "backcourt");
    expect(backcourt).toMatchObject({ attempts: 2, makes: 0, points: 0 });
  });
});
