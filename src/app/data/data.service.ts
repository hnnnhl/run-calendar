import { Injectable } from '@angular/core';
import { DistanceData } from './data.model';
import { knownFolders, Folder, File, path } from "@nativescript/core/file-system";
import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { variable } from '@angular/compiler/src/output/output_ast';


@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _storage = require("nativescript-android-fs");
  private _dataFolder = "/Android/data/org.nativescript.RunCalendar";
  private _dataFile = "data.txt";

  private folderPath: string = path.join(knownFolders.documents().path, "RunCalendarData"); 
  private folder: Folder = <Folder>Folder.fromPath(this.folderPath);
  private filePath: string = path.join(this.folder.path, "data.json"); 
  private storageFile: File = File.fromPath(this.filePath);

  private _AllData: DistanceData[] = [];

  private _unit: string = "mi";

  constructor() {
      this._AllData = this.readData();
      console.log('reading files: '+this.storageFile.readTextSync());
  }

  getAllData(): DistanceData[] {
    return this.readData();
  }

  public set unit(unitChange: string) {
    if (unitChange === 'miles' || unitChange === 'mi'){
      this._unit = 'mi';
    }
    if (unitChange === 'kilometers' || unitChange === 'km'){
      this._unit = 'km';
    }
  }

  public get unit() {
    if (this._unit === 'mi')
      { return 'miles';}
    else
      { return 'kilometers';}
  }

  public convertToMi(km: number): number {
    return km * 0.621371
  }

  public convertToKm(mi: number): number {
    return mi * 1.60934
  }

  public readData(): DistanceData[] {
    var readDistanceData: DistanceData[] = [];

    try{
      if(JSON.parse(this.storageFile.readTextSync())){

        const readData: DistanceData[] = JSON.parse(this.storageFile.readTextSync());
        readData.forEach(data => {
          var dateString: string = data.date.toString();
          var parsedDate: Date = new Date(dateString);
          readDistanceData.push({date: parsedDate, distance: data.distance});
        });

      }}
    catch (e){
      console.log("read error: "+e);
    }

    return readDistanceData;
  }

  public addEntry(entry: DistanceData) {
    console.log('dataservice entry'+ entry.distance);
    if (this._unit === 'mi'){
      entry.distance = this.convertToKm(entry.distance);
    }
    console.log('converted'+ entry.distance);
    this._AllData.push(entry);
    this.save();
  }

  public save(){
    var AllDataString: string = JSON.stringify(this._AllData);
    this.storageFile.writeTextSync(AllDataString);
  }

  public deleteAllData(){
    this.storageFile.removeSync();
    this._AllData = [];
  }

  public getEarliestEntryDay(): Date{
    
    if (this._AllData.length > 0){
      var dateOrderedData: DistanceData[] = this._AllData.sort((a, b) => {
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

  /* public save(){
    var AllDataString: string = JSON.stringify(this.AllData);

    var file = this._storage.delete(this._dataFolder, this._dataFile);
    if (file){console.log('deleted file');}
    file = this._storage.create(this._dataFolder, this._dataFile, AllDataString);
    if (file){console.log('created file');}
 
  }
 */
  averageData(startDate: Date, endDate: Date): {average: number, totalDistance: number, dayDifference: number}{

      if (this._AllData.length > 0){
      // Iterating through AllData and pushing only the data within the startDate and endDate to dateFilteredData
      var datefilteredData: DistanceData[] = [];

      if (startDate < this.getEarliestEntryDay()){
        startDate = this.getEarliestEntryDay();
      }

      startDate.setHours(0,0,0,0);
      endDate.setHours(0,0,0,0);

          this._AllData.forEach(data => {

            //Copying data to a variable to set the Date value to midnight
            var tempData = {...data}; 
            tempData.date.setHours(0,0,0,0);

            if ((startDate <= tempData.date) && (tempData.date <= endDate)){
              datefilteredData.push(data);
            }
          });

      var distanceSum = 0;
      datefilteredData.forEach(data => {
        distanceSum += data.distance;
      });

      // Calculating the number of days between startDate and endDate
      const timeDiff: number = endDate.getTime() - startDate.getTime();
      var dayDiff: number = timeDiff / (1000 * 3600 * 24);

      if (dayDiff < 1) {
        dayDiff = 1;
      }

      return {average: (distanceSum/dayDiff), totalDistance: distanceSum, dayDifference: dayDiff};
    }
    else {
      return {average: 0, totalDistance: 0, dayDifference: 0}
    }
  }

  // Remove later. For testing the contents of the data.json file.
  public testPrint(): string{
    var testString = '';
    this._AllData.forEach(x =>{
      testString += "//"+ x.date + " " + x.distance+" //";
    });

    return testString;
  }

    // Remove later. For testing the contents of the data.json file.
  public testRead(): string{
      var testString = this.storageFile.readTextSync();
    /*   const dataFileContents = this._storage.read(this._dataFolder, this._dataFile);
      if(dataFileContents){
        testString = dataFileContents;
      } */
  
      return testString;
    }

}