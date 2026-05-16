import type { ContestLevel, Shot, ShotType } from "../types/shots";
import {
  getDribbleBucket,
  getShotClockBucket,
  getShotDistance,
  getShotValue,
  getShotZone,
} from "./shotModel";

type RawRow = Record<string, string>;

/** Loads and parses the static shot CSV from the public asset path. */
export async function loadShots(url = "/data/shots.csv"): Promise<Shot[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load shots.csv (${response.status})`);
  }

  const text = await response.text();
  return parseShotCsv(text);
}

/** Parses the project shot CSV into typed rows with derived zones, distance, value, and filter buckets. */
export function parseShotCsv(text: string): Shot[] {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  if (!headerLine) return [];
  const headers = parseCsvLine(headerLine);

  return lines
    .map((line) => parseCsvLine(line))
    .filter((cells) => cells.length === headers.length)
    .map((cells) => {
      const raw = Object.fromEntries(
        headers.map((header, index) => [header, cells[index]])
      ) as RawRow;
      const x = toRequiredNumber(raw.x, "x");
      const y = toRequiredNumber(raw.y, "y");
      const dribblesBefore = toNumber(raw.dribbles_before);
      const shotClock = toNumber(raw.shot_clock);
      const zone = getShotZone(x, y);

      return {
        shooterId: raw.shooter_id,
        shooterName: raw.shooter_name,
        date: toDate(raw.year, raw.month, raw.day),
        year: toRequiredNumber(raw.year, "year"),
        month: toRequiredNumber(raw.month, "month"),
        day: toRequiredNumber(raw.day, "day"),
        period: toRequiredNumber(raw.period, "period"),
        startGameClock: toNumber(raw.start_game_clock),
        endGameClock: toNumber(raw.end_game_clock),
        shotClock,
        x,
        y,
        outcome: toBool(raw.outcome, "outcome"),
        passerX: raw.passer_x ? toNumber(raw.passer_x) : null,
        passerY: raw.passer_y ? toNumber(raw.passer_y) : null,
        assisted: toBool(raw.assisted, "assisted"),
        assistOpportunity: toBool(raw.ast_opp, "ast_opp"),
        blocked: toBool(raw.blocked, "blocked"),
        fouled: toBool(raw.fouled, "fouled"),
        shotType: toShotType(raw.shot_type),
        complexShotType: raw.complex_shot_type,
        contested: toBool(raw.contested, "contested"),
        contestLevel: toContestLevel(raw.contest_level),
        catchAndShoot: toBool(raw.catch_and_shoot, "catch_and_shoot"),
        dribblesBefore,
        zone,
        distance: getShotDistance(x, y),
        shotValue: getShotValue(x, y),
        shotClockBucket: getShotClockBucket(shotClock),
        dribbleBucket: getDribbleBucket(dribblesBefore),
      };
    });
}

/** Splits one CSV record while respecting quoted cells and escaped quotes. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

/** Converts a numeric CSV cell into a number, preserving blanks as missing values. */
function toNumber(value: string): number {
  const trimmed = value.trim();
  if (trimmed === "") return Number.NaN;
  return Number(trimmed);
}

function toRequiredNumber(value: string, field: string): number {
  const parsed = toNumber(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid numeric value for ${field}: "${value}"`);
  return parsed;
}

/** Converts the dataset's uppercase boolean strings into booleans and rejects unknown values. */
function toBool(value: string, field: string): boolean {
  if (value === "TRUE") return true;
  if (value === "FALSE") return false;
  throw new Error(`Invalid boolean value for ${field}: "${value}"`);
}

/** Builds an ISO date string from separate year, month, and day CSV cells. */
function toDate(year: string, month: string, day: string): string {
  const yearNumber = toNumber(year);
  const monthNumber = toNumber(month);
  const dayNumber = toNumber(day);
  const date = new Date(yearNumber, monthNumber - 1, dayNumber);
  if (
    !Number.isInteger(yearNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(dayNumber) ||
    date.getFullYear() !== yearNumber ||
    date.getMonth() !== monthNumber - 1 ||
    date.getDate() !== dayNumber
  ) {
    throw new Error(`Invalid date value: ${year}-${month}-${day}`);
  }
  return `${yearNumber}-${String(monthNumber).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
}

function toShotType(value: string): ShotType {
  if (value === "heave" || value === "jumper" || value === "post" || value === "floater" || value === "layup") {
    return value;
  }
  throw new Error(`Invalid shot_type value: "${value}"`);
}

function toContestLevel(value: string): ContestLevel {
  if (value === "uncontested" || value === "lightly_contested" || value === "heavily_contested") {
    return value;
  }
  throw new Error(`Invalid contest_level value: "${value}"`);
}
