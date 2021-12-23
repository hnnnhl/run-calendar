import { Injectable } from '@angular/core';
import { DistanceData } from './data.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _storage = require("nativescript-android-fs");
  private _dataFolder = "/Android/data/org.nativescript.RunCalendar";
  private _dataFile = "data.txt";

  public AllData: DistanceData[] = [];

  constructor() {
      this.getData();
  }

  public getData() {
    const dataFileContents = this._storage.read(this._dataFolder, this._dataFile);
    if(dataFileContents){
      this.AllData = JSON.parse(dataFileContents);
    }
  }

  public addEntry(entry: DistanceData) {
    this.AllData.push(entry);
    this.save();
  }

  public save(){
    var AllDataString: string = JSON.stringify(this.AllData);
    this._storage.create(this._dataFolder, this._dataFile, AllDataString);
  }

  averageDistance(startDate: Date, endDate: Date): number{
    // Iterating through AllData and pushing only the data within the startDate and endDate to dateFilteredData
    var datefilteredData: DistanceData[] = [];
    this.AllData.forEach(data => {
      if ((startDate <= data.date) && (data.date <= endDate)){
        datefilteredData.push(data);
      }
    });

    var distanceSum = 0;
    datefilteredData.forEach(data => {
      distanceSum += data.distance;
    });

    // Calculating the number of days between startDate and endDate
    const timeDiff: number = endDate.getTime() - startDate.getTime();
    const dayDiff: number = timeDiff / (1000 * 3600 * 24);

    return (distanceSum/dayDiff);
  }

  // Remove later. For testing the contents of the data.json file.
  public testPrint(): string{
    var testString = '';
    this.AllData.forEach(x =>{
      testString += x.date + " " + x.distance;
    });

    return testString;
  }

}