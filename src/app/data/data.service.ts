import { Injectable } from "@angular/core";
import { DistanceData, DistanceDataEntry, Goal, GoalEntry } from "./data.model";
import {
  knownFolders,
  Folder,
  File,
  path,
} from "@nativescript/core/file-system";

@Injectable({
  providedIn: "root",
})
export class DataService {

  private folderPath: string = path.join(
    knownFolders.documents().path,
    "RunCalendarData"
  );
  private _folder: Folder = <Folder>Folder.fromPath(this.folderPath);
  private _distanceFilePath: string = path.join(this._folder.path, "data.json");
  private _distanceStorageFile: File = File.fromPath(this._distanceFilePath);
  private _goalFilePath: string = path.join(this._folder.path, "goals.json");
  private _goalStorageFile: File = File.fromPath(this._goalFilePath);
  private _goalMapFilePath: string = path.join(this._folder.path, "goalMap.json");
  private _goalMapStorageFile: File = File.fromPath(this._goalMapFilePath);

  private _AllDistanceData: DistanceData[] = [];
  private _AllGoals: Goal[] = [];
  private _GoalMap: {goalId: number, date: Date}[] = []; // Keeps tracks of which dates already have goals assigned

  private _unit: string = "mi";
  private _ID: number;

  public distancesUpdated: boolean = false;
  public goalsUpdated: boolean = false;

  constructor() {
    this._AllDistanceData = this._readDistanceData();
    console.log("reading distances : " + this._distanceStorageFile.readTextSync());
    this._AllGoals = this._readGoals();
    console.log("reading goals: " + this._goalStorageFile.readTextSync());
    this._GoalMap = this._readGoalMap();
    console.log("reading goal map: " + this._goalMapStorageFile.readTextSync());
  }

  public getAllDistanceData(): DistanceData[] {
    return this._readDistanceData();
  }

  public getAllGoals(): Goal[] {
    return this._readGoals();
  }

  public set unit(unitChange: string) {
    if (unitChange === "miles" || unitChange === "mi") {
      this._unit = "mi";
    }
    if (unitChange === "kilometers" || unitChange === "km") {
      this._unit = "km";
    }
  }

  public get unit() {
    if (this._unit === "mi") {
      return "miles";
    } else {
      return "kilometers";
    }
  }

  public convertToMi(km: number): number {
    return km * 0.621371;
  }

  public convertToKm(mi: number): number {
    return mi * 1.60934;
  }

  private _readDistanceData(): DistanceData[] {
    var distanceData: DistanceData[] = [];

    try {
      if (JSON.parse(this._distanceStorageFile.readTextSync())) {
        const readData: DistanceData[] = JSON.parse(
          this._distanceStorageFile.readTextSync()
        );
        readData.forEach((data) => {
          let dateString: string = data.date.toString();
          let parsedDate: Date = new Date(dateString);
          let entryDateString: string = data.entryDate.toString();
          let parsedEntryDate: Date = new Date(entryDateString);
          distanceData.push({
            id: data.id,
            date: parsedDate,
            distance: data.distance,
            activity: data.activity,
            originalUnit: data.originalUnit,
            originalEntry: data.originalEntry,
            entryDate: parsedEntryDate,
          });
        });
      }
    } catch (e) {
      console.log("read error: " + e);
    }

    return distanceData;
  }

  private _readGoals(): Goal[] {
    var goalData: Goal[] = [];

    try {
      if (JSON.parse(this._goalStorageFile.readTextSync())) {
        const readData: Goal[] = JSON.parse(
          this._goalStorageFile.readTextSync()
        );
        readData.forEach((goal) => {
          let dateString: string = goal.date.toString();
          let parsedDate: Date = new Date(dateString);
          let setDateString: string = goal.setDate.toString();
          let parsedSetDate: Date = new Date(setDateString);
          let startDateString: string = goal.startDate? goal.startDate.toString() : null;
          let parsedStartDate: Date = new Date(startDateString);
          let achievedDateString: string = goal.achievedDate? goal.achievedDate.toString() : null;
          let parsedAchievedDate: Date = new Date(achievedDateString);
          goalData.push({
            id: goal.id,
            date: parsedDate,
            activity: goal.activity,
            distance: goal.distance,
            originalEntry: goal.originalEntry,
            originalUnit: goal.originalUnit,
            setDate: parsedSetDate,
            startDate: parsedStartDate,
            achievedDate: parsedAchievedDate,
            distanceRemaining: goal.distanceRemaining
          });
        });
      }
    } catch (e) {
      console.log("goal read error: " + e);
    }

    return goalData;
  }

  private _readGoalMap(): {goalId: number, date: Date}[] {
    var goalMapData: {goalId: number, date: Date}[] = [];

    try {
      if (JSON.parse(this._goalMapStorageFile.readTextSync())) {
        const readData: {goalId: number, date: Date}[] = JSON.parse(
          this._goalMapStorageFile.readTextSync()
        );
        readData.forEach((goal) => {
          let dateString: string = goal.date.toString();
          let parsedDate: Date = new Date(dateString);

          goalMapData.push({
            goalId: goal.goalId,
            date: parsedDate
          });
        });
      }
    } catch (e) {
      console.log("goal map read error: " + e);
    }

    return goalMapData;
  }

  public addEntry(entry: DistanceDataEntry) {
    let kmDistance: number = entry.distance;
    let entryUnit: string;

    if (entry.unit) {
      entryUnit = entry.unit;
    } else {
      entryUnit = this.unit;
    }
  
    if (entryUnit === "mi" || entryUnit === "miles") {
      kmDistance = this.convertToKm(entry.distance);
    }

    const fullEntry: DistanceData = {
      id: this._generateEntryId(),
      date: entry.date,
      distance: kmDistance,
      activity: entry.activity,
      originalUnit:
        entryUnit === "kilometers" || entryUnit === "km" ? "km" : "mi",
      originalEntry: entry.distance,
      entryDate: new Date(),
    };

    this._AllDistanceData.push(fullEntry);

    this.saveDistanceData();
    this._updateGoals(fullEntry);
  }

  public updateEntry(updatedEntry: DistanceDataEntry, entryID: number) {
    let kmDistance: number = updatedEntry.distance;
    let entryUnit: string;

    if (updatedEntry.unit) {
      entryUnit = updatedEntry.unit;
    } else {
      entryUnit = this.unit;
    }
  
    if (entryUnit === "mi" || entryUnit === "miles") {
      kmDistance = this.convertToKm(updatedEntry.distance);
    }

    const fullEntry: DistanceData = {
      id: entryID,
      date: updatedEntry.date,
      distance: kmDistance,
      activity: updatedEntry.activity,
      originalUnit:
        entryUnit === "kilometers" || entryUnit === "km" ? "km" : "mi",
      originalEntry: updatedEntry.distance,
      entryDate: new Date(),
    };

    //this._AllDistanceData.push(fullEntry);
    let entryIndex: number = this._AllDistanceData.findIndex(entry => entry.id === entryID);
    let oldEntry: DistanceData = this._AllDistanceData.splice(entryIndex, 1, fullEntry)[0];

    this.saveDistanceData();
    this._updateGoals(fullEntry, oldEntry);
  }

  public addGoal(goal: GoalEntry) {
    let kmDistance: number = goal.distance;
    let entryUnit: string;

    if (goal.unit) {
      entryUnit = goal.unit;
    } else {
      entryUnit = this.unit;
    }
  
    if (entryUnit === "mi" || entryUnit === "miles") {
      kmDistance = this.convertToKm(goal.distance);
    }

    const fullGoal: Goal = {
      id: this._generateGoalId(),
      date: goal.date,
      distance: kmDistance,
      activity: goal.activity,
      originalUnit:
        entryUnit === "kilometers" || goal.unit === "km" ? "km" : "mi",
      originalEntry: goal.distance,
      setDate: new Date(),
      startDate: goal.startDate ? goal.startDate : null,
      distanceRemaining: kmDistance
    };

    this._AllGoals.push(fullGoal);
    this.saveGoals();
    
    // Updating _GoalMap
    if (goal.startDate){
      let initDate: Date = new Date(goal.startDate.getTime());
      let endDate: Date = new Date(goal.date.getTime());
      endDate.setDate(endDate.getDate()+1);
      while (!(this.sameDay(initDate, endDate))){
        this._GoalMap.push({goalId: fullGoal.id, date: new Date(initDate.getTime())});
        initDate.setDate(initDate.getDate()+1);
      }
    } 

   // this._GoalMap.push({goalId: fullGoal.id, date: fullGoal.date});
    this.saveGoalMap();
    
  }

  public deleteEntry(entry: DistanceData) {
    let entryIndex = this._AllDistanceData.findIndex((x) => x.id === entry.id);
    let deletedEntry = this._AllDistanceData.splice(entryIndex, 1);
    console.log(
      "entry deleted: " + deletedEntry[0].date + "//id: " + deletedEntry[0].id
    );
    this.saveDistanceData();
  }

  public saveDistanceData() {
    var AllDataString: string = JSON.stringify(this._AllDistanceData);
    this._distanceStorageFile.writeTextSync(AllDataString);
  }

  public saveGoals() {
    var AllGoalsString: string = JSON.stringify(this._AllGoals);
    this._goalStorageFile.writeTextSync(AllGoalsString);
  }

  public saveGoalMap() {
    var GoalMapString: string = JSON.stringify(this._GoalMap);
    this._goalMapStorageFile.writeTextSync(GoalMapString);
  }

  public deleteAllData() {
    this._distanceStorageFile.removeSync();
    this._goalStorageFile.removeSync();
    this._goalMapStorageFile.removeSync();
    this._AllDistanceData = [];
    this._AllGoals = [];
    this._GoalMap = [];
  }

  
  private _updateGoals(entry: DistanceData, oldEntry?: DistanceData){
    // Updating goals 
    let goalDateSearch = this._GoalMap.find(x => this.sameDay(x.date, entry.date));
    if (goalDateSearch){ 
      let goalSearch: Goal = this._AllGoals.find(x => x.id === goalDateSearch.goalId && entry.activity === x.activity);
        if (goalSearch){ 
          if (oldEntry){
            goalSearch.distanceRemaining += oldEntry.distance; //Re-adding the old entry's distance
          }
          goalSearch.distanceRemaining -= entry.distance; //Updating distance remaining for goal
          if (goalSearch.distanceRemaining <= 0){ // Goal achieved
            goalSearch.achievedDate = new Date(); // Logging current date as date achieved
            
            this._GoalMap.forEach((x, index) => { // Deleting goal from _GoalMap
              if (x.goalId === goalDateSearch.goalId){
                this._GoalMap.splice(index, 1);
              }
            });
            this.saveGoalMap();
          }
          this.saveGoals();
        }
     }
  }

  public getEarliestEntryDay(): Date {
    if (this._AllDistanceData.length > 0) {
      var dateOrderedData: DistanceData[] = this._AllDistanceData.sort((a, b) => {
        if (a.date > b.date) {
          return 1;
        }
        if (a.date < b.date) {
          return -1;
        }
        return 0;
      });
      return dateOrderedData[0].date;
    } else {
      return new Date();
    }
  }

  public averageData(
    startDate: Date,
    endDate: Date
  ): { average: number; totalDistance: number; dayDifference: number } {
    if (this._AllDistanceData.length > 0) {
      // Iterating through AllData and pushing only the data within the startDate and endDate to dateFilteredData
      var datefilteredData: DistanceData[] = [];

      if (startDate < this.getEarliestEntryDay()) {
        startDate = this.getEarliestEntryDay();
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      this._AllDistanceData.forEach((data) => {
        //Copying data to a variable to set the Date value to midnight
        var tempData = { ...data };
        tempData.date.setHours(0, 0, 0, 0);

        if (startDate <= tempData.date && tempData.date <= endDate) {
          datefilteredData.push(data);
        }
      });

      var distanceSum = 0;
      datefilteredData.forEach((data) => {
        distanceSum += data.distance;
      });

      // Calculating the number of days between startDate and endDate
      const timeDiff: number = endDate.getTime() - startDate.getTime();
      var dayDiff: number = timeDiff / (1000 * 3600 * 24);

      if (dayDiff < 1) {
        dayDiff = 1;
      }

      return {
        average: distanceSum / dayDiff,
        totalDistance: distanceSum,
        dayDifference: dayDiff,
      };
    } else {
      return { average: 0, totalDistance: 0, dayDifference: 0 };
    }
  }

  private _generateEntryId(): number {
    if (this._AllDistanceData && this._AllDistanceData.length > 0) {
      let lastID: number = this._AllDistanceData[this._AllDistanceData.length - 1].id;
      this._ID = lastID + 1;
    } else {
      this._ID = 1000000;
    }

    return this._ID;
  }

  private _generateGoalId(): number {
    if (this._AllGoals && this._AllGoals.length > 0) {
      let lastID: number = this._AllGoals[this._AllGoals.length - 1].id;
      this._ID = lastID + 1;
    } else {
      this._ID = 1000000;
    }

    return this._ID;
  }

  // Remove later. For testing the contents of the data.json file.
  public testPrint(): string {
    var testString = "";
    this._AllDistanceData.forEach((x) => {
      testString +=
        "//" + x.date + " " + x.distance + " //" + x.activity + " //";
    });

    return testString;
  }

  // Remove later. For testing the contents of the data.json file.
  public testRead(): string {
    var testString = this._distanceStorageFile.readTextSync();
    return testString;
  }

  public sameDay(date1: Date, date2: Date): boolean {
    if (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    ) {
      return true;
    } else {
      return false;
    }
  }

  /** Returns a goalID if a collision exists */
  public goalDateCollision(newGoal: GoalEntry): number{
    if (newGoal.startDate){ // Checking range of dates between start date and goal date
      let initDate: Date = new Date(newGoal.startDate.getTime());
      while (!(this.sameDay(initDate, newGoal.date))){
        let dateLookup = this._GoalMap.find(x => this.sameDay(initDate, x.date));
        if (dateLookup){
          let goalLookup: Goal = this._AllGoals.find(x => x.id === dateLookup.goalId && x.activity === newGoal.activity);
          if (goalLookup){
            return dateLookup.goalId;
          }
        }
        initDate.setDate(initDate.getDate()+1);
      }
    }

    // Checking goal date (for both multi-day goals and single day goals)
    let dateLookup = this._GoalMap.find(x => this.sameDay(newGoal.date, x.date));
      if (dateLookup){
        let goalLookup: Goal = this._AllGoals.find(x => x.id === dateLookup.goalId && x.activity === newGoal.activity);
          if (goalLookup){
            return dateLookup.goalId;
          }
        } 
      else {
        return null;
      }

    }


}