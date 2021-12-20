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

  constructor() {}

  public getData() {
    if(JSON.parse(this.storageFile.readTextSync())){
      this.AllData = JSON.parse(this.storageFile.readTextSync());
    }
  }

  public addEntry(entry: DistanceData) {
    this.AllData.push(entry);
  }

  public save(){
    var AllDataString: string = JSON.stringify(this.AllData);
    this.storageFile.writeTextSync(AllDataString);
  }

  //Remove later. For testing the contents of the data.json file.
  public testPrint(): string{
    var testString = '';
    this.AllData.forEach(x =>{
      testString += x.date + " " + x.distance;
    });

    return testString;
  }

}