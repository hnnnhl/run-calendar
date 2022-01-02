export interface DistanceData {
  id: number;
  date: Date;
  distance: number; //in km
  activity: string;
  originalEntry: number;
  originalUnit: string;
  entryDate: Date;
}

export interface DistanceDataEntry {
  date: Date;
  distance: number; //in km
  activity: string;
  unit?: string;
}
