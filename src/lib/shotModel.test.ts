import { describe, expect, it } from "vitest";
import {
  formatZoneWithRange,
  getDribbleBucket,
  getShotClockBucket,
  getShotValue,
  getShotZone,
} from "./shotModel";

describe("getShotZone", () => {
  it("classifies at-hoop coordinates as rim", () => {
    expect(getShotZone(-47, 0)).toBe("rim");
    expect(getShotZone(-45, 1)).toBe("rim");
  });

  it("classifies short range as paint and progressively further out as midrange", () => {
    expect(getShotZone(-40, 0)).toBe("paint");
    expect(getShotZone(-37, 0)).toBe("short_midrange");
    expect(getShotZone(-30, 0)).toBe("long_midrange");
  });

  it("classifies a shot just beyond the arc as above_break_three", () => {
    expect(getShotZone(-22, 0)).toBe("above_break_three");
  });

  it("classifies sideline shots inside the corner zone as corner_three", () => {
    expect(getShotZone(-44, 22)).toBe("corner_three");
    expect(getShotZone(-44, -22)).toBe("corner_three");
  });

  it("classifies shots past the modeled half court as backcourt", () => {
    expect(getShotZone(10, 0)).toBe("backcourt");
  });
});

describe("getShotValue", () => {
  it("returns 2 points for shots inside the arc", () => {
    expect(getShotValue(-44, 0)).toBe(2);
    expect(getShotValue(-30, 0)).toBe(2);
  });

  it("returns 3 points for above-break and corner threes", () => {
    expect(getShotValue(-22, 0)).toBe(3);
    expect(getShotValue(-44, 22)).toBe(3);
  });
});

describe("formatZoneWithRange", () => {
  it("adds distance definitions to zone labels", () => {
    expect(formatZoneWithRange("rim")).toBe("Rim (0-4 ft)");
    expect(formatZoneWithRange("above_break_three")).toBe("Above-Break 3 (23.75+ ft)");
    expect(formatZoneWithRange("backcourt")).toBe("Backcourt Heave (beyond half court)");
  });
});

describe("bucket helpers", () => {
  it("buckets the shot clock into early/middle/late/end phases", () => {
    expect(getShotClockBucket(22)).toBe("early");
    expect(getShotClockBucket(12)).toBe("middle");
    expect(getShotClockBucket(6)).toBe("late");
    expect(getShotClockBucket(2)).toBe("end");
  });

  it("treats non-finite clock values as unknown", () => {
    expect(getShotClockBucket(Number.NaN)).toBe("unknown");
  });

  it("groups 2-3 dribbles together and 4+ together", () => {
    expect(getDribbleBucket(0)).toBe("0");
    expect(getDribbleBucket(1)).toBe("1");
    expect(getDribbleBucket(2)).toBe("2-3");
    expect(getDribbleBucket(3)).toBe("2-3");
    expect(getDribbleBucket(7)).toBe("4+");
  });
});
