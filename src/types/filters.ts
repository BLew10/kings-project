import type {
  ContestLevel,
  DribbleBucket,
  ShotClockBucket,
  ShotType,
  ShotZone,
} from "@/types/shots";

export type ScalarBooleanFilter = "all" | "true" | "false";

export type Filters = {
  player: string[];
  shotType: ShotType[];
  complexShotType: string[];
  contestLevel: ContestLevel[];
  zone: ShotZone[];
  shotClockBucket: ShotClockBucket[];
  dribbleBucket: DribbleBucket[];
  shotValue: Array<"2" | "3">;
  period: string[];
  assisted: ScalarBooleanFilter;
  catchAndShoot: ScalarBooleanFilter;
  assistOpportunity: ScalarBooleanFilter;
  blocked: ScalarBooleanFilter;
  fouled: ScalarBooleanFilter;
  contested: ScalarBooleanFilter;
  outcome: ScalarBooleanFilter;
  dateFrom: string;
  dateTo: string;
};
