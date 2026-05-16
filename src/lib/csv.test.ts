import { describe, expect, it } from "vitest";
import { parseShotCsv } from "./csv";

const HEADER =
  "shooter_id,shooter_name,year,month,day,period,start_game_clock,end_game_clock,shot_clock,x,y,outcome,passer_x,passer_y,assisted,ast_opp,blocked,fouled,shot_type,complex_shot_type,contested,contest_level,catch_and_shoot,dribbles_before";

function row(overrides: Partial<Record<string, string>> = {}): string {
  const defaults: Record<string, string> = {
    shooter_id: "abc",
    shooter_name: "Player A",
    year: "2025",
    month: "1",
    day: "15",
    period: "1",
    start_game_clock: "720",
    end_game_clock: "700",
    shot_clock: "12",
    x: "-44",
    y: "0",
    outcome: "TRUE",
    passer_x: "",
    passer_y: "",
    assisted: "FALSE",
    ast_opp: "FALSE",
    blocked: "FALSE",
    fouled: "FALSE",
    shot_type: "layup",
    complex_shot_type: "drive_layup",
    contested: "FALSE",
    contest_level: "uncontested",
    catch_and_shoot: "FALSE",
    dribbles_before: "1",
  };
  return HEADER.split(",")
    .map((field) => overrides[field] ?? defaults[field])
    .join(",");
}

describe("parseShotCsv", () => {
  it("parses rows and assigns derived zone, distance, and shot value", () => {
    const csv = [HEADER, row({ x: "-22", y: "0" })].join("\n");
    const shots = parseShotCsv(csv);

    expect(shots).toHaveLength(1);
    expect(shots[0].zone).toBe("above_break_three");
    expect(shots[0].shotValue).toBe(3);
    expect(shots[0].distance).toBeCloseTo(25, 0);
  });

  it("returns an empty array for an empty input", () => {
    expect(parseShotCsv("")).toEqual([]);
  });

  it("converts uppercase TRUE/FALSE strings into booleans", () => {
    const csv = [
      HEADER,
      row({ outcome: "TRUE", assisted: "FALSE", contested: "TRUE" }),
    ].join("\n");
    const shot = parseShotCsv(csv)[0];

    expect(shot.outcome).toBe(true);
    expect(shot.assisted).toBe(false);
    expect(shot.contested).toBe(true);
  });

  it("builds an ISO date string from separate year/month/day cells", () => {
    const csv = [HEADER, row({ year: "2025", month: "4", day: "5" })].join("\n");
    expect(parseShotCsv(csv)[0].date).toBe("2025-04-05");
  });

  it("throws on an invalid boolean cell rather than silently coercing", () => {
    const csv = [HEADER, row({ outcome: "maybe" })].join("\n");
    expect(() => parseShotCsv(csv)).toThrow(/outcome/);
  });
});
