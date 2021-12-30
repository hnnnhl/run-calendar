import { Component, Input, OnInit } from '@angular/core'
import { ObservableArray } from '@nativescript/core';
import { DistanceData } from '~/app/data/data.model';
import { DataService } from '~/app/data/data.service';
import { MonthMap, MonthTileObject } from '../calendar-data.model';
import { CalendarEntriesService } from '../calendar-entries.service';



@Component({
  selector: 'Month',
  templateUrl: './month.component.html',
})
export class MonthComponent implements OnInit {

    @Input() month: number;
    @Input() year: number;
    @Input() daysOfMonth: MonthTileObject[];
    daysOfMonthArray: ObservableArray<MonthTileObject>;

    public currentMonth: MonthMap;
   // public currentRow: number = 2;

    public today: Date;
    public tomorrow: Date;
    public earliest: Date;
    //public showTileDistance: boolean;

    constructor(private _dataService: DataService, private _entriesService: CalendarEntriesService){}

    ngOnInit(): void {

     if(this.month && this.year){
            this.daysOfMonth = this._entriesService.setupMonthTiles(this.month, this.year);
        } 

      this.currentMonth = this._entriesService.currentMonth;

      this.today = new Date();
      this.tomorrow = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()+1);
      this.earliest = new Date(this._dataService.getEarliestEntryDay().getTime());
      this.earliest.setDate(this.earliest.getDate()-1);
      this.earliest.setHours(23, 59, 59);

    }

    showTileDistance(tileDate: Date): boolean{
      if (this.earliest < tileDate && tileDate < this.tomorrow) { 
        return true;
      } 
      else {
        return false;
      }
  }
    
    polishDistance(distance: number): number{
      // Distances are stored in km by default
      // This converts the raw distances into miles if the user has selected miles 
      // and rounds the numbers to display on the calendar

      let conversion: number = distance;
 
      if (this._dataService.unit === "mi" || this._dataService.unit === "miles"){
        conversion = this._dataService.convertToMi(distance);
      }
    
        return parseFloat(conversion.toFixed(1));
     
    }

  getDateStyle(tile: MonthTileObject): string{
    //{'color':item.primaryMonth ? 'white' : '#6e6a73' }
    if (this._entriesService.sameDay(tile.date, new Date())){
      return 'monthTile today';
    }
    else if (!tile.primaryMonth) {
      return 'monthTile another';
    } 
    else {
      return 'monthTile';
    }
  }

  getDistanceStyle(tile: MonthTileObject): string {
    if (tile.distanceData.distance != 0) {
      return 'distance goalMet'
    } 
    else {
      return 'distance none'
    }
  }
}