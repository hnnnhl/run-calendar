import { Injectable } from '@angular/core';
import { DistanceData } from './data.model';

import { knownFolders, Folder, File, path } from "@nativescript/core/file-system";

@Injectable({
  providedIn: 'root',
})
export class DataService {
  
  // path: /data/user/0/org.nativescript.RunCalendar/files/RunCalendarData/data.json
  private folderPath: string = path.join(knownFolders.documents().path, "RunCalendarData");
  private folder: Folder = <Folder>Folder.fromPath(this.folderPath);
  private filePath: string = path.join(this.folder.path, "data.json");
  private storageFile: File = File.fromPath(this.filePath);

  public AllData: DistanceData[] = [];

  constructor() {
    try{
      this.getData();}
    catch(e){
        console.log("ERROR FROM CONSOLE: "+e);
      }

  }

  public getData() {
    if(JSON.parse(this.storageFile.readTextSync())){
      this.AllData = JSON.parse(this.storageFile.readTextSync());
    }
  }

  public addEntry(entry: DistanceData) {
    this.AllData.push(entry);
    this.save();
  }

  public save(){
    var AllDataString: string = JSON.stringify(this.AllData);
    this.storageFile.writeTextSync(AllDataString);
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