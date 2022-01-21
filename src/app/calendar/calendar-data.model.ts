import { DistanceData } from "~/app/data/data.model";

export interface MonthMap {
  index: number;
  name: string;
}

export interface MonthObject {
  month: number,
  year: number,
  tiles: MonthTileObject[]
}

export interface MonthTileObject {
  date: Date;
  distances: ActivitySummary;
  goals?: ActivitySummary;
  row: number;
  column: number;
  month: string;
  year: number;
  primaryMonth?: boolean; //Indicates whether or not this tile represents a day in the current month
}

export interface ActivitySummary {
  date: Date;
  totalRunDistance: number;
  totalWalkDistance: number;
}
