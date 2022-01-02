import { DistanceData } from "~/app/data/data.model";

export interface MonthMap {
  index: number;
  name: string;
}

export interface MonthTileObject {
  date: Date;
  //distanceData: DistanceData,
  distances: ActivitySummary;
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
