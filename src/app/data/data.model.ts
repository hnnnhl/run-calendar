export interface DataObject {
  id: number;
  date: Date;
  activity: string;
  distance: number; //in km
  originalEntry: number;
  originalUnit: string;
}

export interface Entry {
  date: Date;
  distance: number; //in km
  activity: string;
  unit?: string;
}

export class DistanceData implements DataObject {
  id: number;
  date: Date;
  distance: number; //in km
  activity: string;
  originalEntry: number;
  originalUnit: string;
  entryDate: Date;
}

export interface DistanceDataEntry extends Entry {
  date: Date;
  distance: number; //in km
  activity: string;
  unit?: string;
}

export class Goal implements DataObject {
  id: number;
  date: Date;
  activity: string;
  distance: number; //in km
  originalEntry: number;
  originalUnit: string;
  startDate?: Date; // End date will be the date
  setDate: Date;
  achievedDate?: Date;
  distanceRemaining: number;
}

export interface GoalEntry extends Entry {
  date: Date;
  activity: string;
  distance: number; 
  unit: string;
  startDate?: Date; // End date will be the date
}



