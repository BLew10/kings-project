import type { Shot } from "../types/shots";
import {
  getDribbleBucket,
  getShotClockBucket,
  getShotDistance,
  getShotZone,
} from "./shotModel";

type RawRow = Record<string, string>;

export async function loadShots(): Promise<Shot[]> {
  const response = await fetch("/data/shots.csv");
  if (!response.ok) {
    throw new Error(`Unable to load shots.csv (${response.status})`);
  }

  const text = await response.text();
  return parseShotCsv(text);
}

export function parseShotCsv(text: string): Shot[] {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return lines
    .map((line) => parseCsvLine(line))
    .filter((cells) => cells.length === headers.length)
    .map((cells) => {
      const raw = Object.fromEntries(
        headers.map((header, index) => [header, cells[index]])
      ) as RawRow;
      const x = toNumber(raw.x);
      const y = toNumber(raw.y);
      const dribblesBefore = toNumber(raw.dribbles_before);
      const shotClock = toNumber(raw.shot_clock);

      return {
        shooterId: raw.shooter_id,
        shooterName: raw.shooter_name,
        date: toDate(raw.year, raw.month, raw.day),
        year: toNumber(raw.year),
        month: toNumber(raw.month),
        day: toNumber(raw.day),
        period: toNumber(raw.period),
        startGameClock: toNumber(raw.start_game_clock),
        endGameClock: toNumber(raw.end_game_clock),
        shotClock,
        x,
        y,
        outcome: toBool(raw.outcome),
        passerX: raw.passer_x ? toNumber(raw.passer_x) : null,
        passerY: raw.passer_y ? toNumber(raw.passer_y) : null,
        assisted: toBool(raw.assisted),
        assistOpportunity: toBool(raw.ast_opp),
        blocked: toBool(raw.blocked),
        fouled: toBool(raw.fouled),
        shotType: raw.shot_type as Shot["shotType"],
        complexShotType: raw.complex_shot_type,
        contested: toBool(raw.contested),
        contestLevel: raw.contest_level as Shot["contestLevel"],
        catchAndShoot: toBool(raw.catch_and_shoot),
        dribblesBefore,
        zone: getShotZone(x, y),
        distance: getShotDistance(x, y),
        shotClockBucket: getShotClockBucket(shotClock),
        dribbleBucket: getDribbleBucket(dribblesBefore),
      };
    });
}

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

function toNumber(value: string): number {
  return Number(value);
}

function toBool(value: string): boolean {
  return value === "TRUE";
}

function toDate(year: string, month: string, day: string): string {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
