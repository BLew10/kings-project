import { describe, expect, it } from "vitest";
import { applyFilters, summarize } from "./stats";
import type { Shot } from "../types/shots";
import type { Filters } from "../types/filters";

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
    outcome: true,
    passerX: null,
    passerY: null,
    assisted: false,
    assistOpportunity: false,
    blocked: false,
    fouled: false,
    shotType: "layup",
    complexShotType: "drive_layup",
    contested: false,
    contestLevel: "uncontested",
    catchAndShoot: false,
    dribblesBefore: 1,
    zone: "rim",
    distance: 3,
    shotValue: 2,
    shotClockBucket: "middle",
    dribbleBucket: "1",
    ...overrides,
  };
}

const NO_FILTERS: Filters = {
  player: [],
  shotType: [],
  complexShotType: [],
  contestLevel: [],
  zone: [],
  shotClockBucket: [],
  dribbleBucket: [],
  shotValue: [],
  period: [],
  assisted: "all",
  catchAndShoot: "all",
  assistOpportunity: "all",
  blocked: "all",
  fouled: "all",
  contested: "all",
  outcome: "all",
  dateFrom: "",
  dateTo: "",
};

describe("applyFilters", () => {
  it("returns every shot when no filters are active", () => {
    const shots = [makeShot(), makeShot({ outcome: false })];
    expect(applyFilters(shots, NO_FILTERS)).toHaveLength(2);
  });

  it("filters by selected player ids", () => {
    const shots = [
      makeShot({ shooterId: "a" }),
      makeShot({ shooterId: "b" }),
      makeShot({ shooterId: "a" }),
    ];
    const filtered = applyFilters(shots, { ...NO_FILTERS, player: ["a"] });
    expect(filtered).toHaveLength(2);
    expect(filtered.every((shot) => shot.shooterId === "a")).toBe(true);
  });

  it("filters by made/missed outcome", () => {
    const shots = [
      makeShot({ outcome: true }),
      makeShot({ outcome: false }),
      makeShot({ outcome: true }),
    ];
    expect(applyFilters(shots, { ...NO_FILTERS, outcome: "true" })).toHaveLength(2);
    expect(applyFilters(shots, { ...NO_FILTERS, outcome: "false" })).toHaveLength(1);
  });

  it("respects an inclusive date range", () => {
    const shots = [
      makeShot({ date: "2025-01-01" }),
      makeShot({ date: "2025-02-15" }),
      makeShot({ date: "2025-03-10" }),
    ];
    const filtered = applyFilters(shots, {
      ...NO_FILTERS,
      dateFrom: "2025-02-01",
      dateTo: "2025-02-28",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].date).toBe("2025-02-15");
  });
});

describe("summarize", () => {
  it("returns zeroed metrics for an empty shot collection", () => {
    const result = summarize([]);
    expect(result.attempts).toBe(0);
    expect(result.makes).toBe(0);
    expect(result.points).toBe(0);
    expect(result.fgPct).toBe(0);
    expect(result.pointsPerShot).toBe(0);
  });

  it("computes FG% from makes over attempts", () => {
    const shots = [
      makeShot({ outcome: true }),
      makeShot({ outcome: true }),
      makeShot({ outcome: false }),
      makeShot({ outcome: false }),
    ];
    const result = summarize(shots);
    expect(result.attempts).toBe(4);
    expect(result.makes).toBe(2);
    expect(result.fgPct).toBe(0.5);
  });

  it("weights points by shot value so a made three is worth more than a made two", () => {
    const shots = [
      makeShot({ outcome: true, shotValue: 2 }),
      makeShot({ outcome: true, shotValue: 3 }),
      makeShot({ outcome: false, shotValue: 3 }),
    ];
    const result = summarize(shots);
    expect(result.points).toBe(5);
    expect(result.pointsPerShot).toBeCloseTo(5 / 3, 4);
  });

  it("averages pass distance only for assisted shots and assist opportunities", () => {
    const shots = [
      makeShot({ x: 0, y: 0, passerX: 3, passerY: 4, assisted: true }),
      makeShot({ x: 0, y: 0, passerX: 0, passerY: 12, assistOpportunity: true }),
      makeShot({ x: 0, y: 0, passerX: 30, passerY: 40, assisted: false, assistOpportunity: false }),
      makeShot({ x: 0, y: 0, passerX: null, passerY: null, assisted: true }),
    ];
    const result = summarize(shots);
    expect(result.avgPassDistance).toBeCloseTo(8.5, 4);
  });
});
