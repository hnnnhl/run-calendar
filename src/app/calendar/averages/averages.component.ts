import { Component, OnInit } from '@angular/core'
import { DataService } from '~/app/data/data.service';

@Component({
  selector: 'Averages',
  templateUrl: './averages.component.html',
})

export class AveragesComponent implements OnInit {

    public dailyAverage: number;
    public weeklyAverage: number;
    public monthlyAverage: number;

  constructor(private _dataService: DataService) {
    // Use the component constructor to inject providers.
  }

  ngOnInit(): void {
    this.setAverages();
  }

  setAverages(){

    const today: Date = new Date();
    var averageData30Days: {average: number, totalDistance: number, dayDifference: number}; //This is the datatype _dataService.averageData() will return
    var thirtyDaysAgo: Date = new Date();
    thirtyDaysAgo.setDate(today.getDate()-30);

    // Calculating Day Average
    averageData30Days = this._dataService.averageData(thirtyDaysAgo, today);
    this.dailyAverage = averageData30Days.average;

    if (this.dailyAverage < 10){
      this.dailyAverage = +this.dailyAverage.toFixed(1);
    }
    else {
      this.dailyAverage = Math.round(this.dailyAverage);
    }


    // Calculating Week Average

    //Getting last full week (Sunday - Saturday)
    var numberOfWeeks: number;
    if (averageData30Days.dayDifference < 30) {
      numberOfWeeks = Math.floor(averageData30Days.dayDifference/7)
      if (numberOfWeeks < 1) {
        numberOfWeeks = 1;
      }
    }
    else{
      numberOfWeeks = 4;
    }

    this.weeklyAverage = averageData30Days.dayDifference/numberOfWeeks;
    if (this.weeklyAverage < 10){
      this.weeklyAverage = +this.weeklyAverage.toFixed(1);
    }
    else {
      this.weeklyAverage = Math.round(this.weeklyAverage);
    }

    var averageData365Days: {average: number, totalDistance: number, dayDifference: number}; //This is the datatype _dataService.averageData() will return
    var yearAgo: Date = new Date();
    yearAgo.setDate(today.getDate()-365);

    averageData365Days = this._dataService.averageData(yearAgo, today);
    var numberOfMonths: number;
    if (averageData365Days.dayDifference < 30) {
      numberOfMonths = Math.floor(averageData365Days.dayDifference/30)
      if (numberOfMonths < 1) {
        numberOfMonths = 1;
      }
    }
    else {
      numberOfMonths = 12;
    }

    this.monthlyAverage = averageData365Days.dayDifference/numberOfMonths;

    if (this.monthlyAverage < 10){
      this.monthlyAverage = +this.monthlyAverage.toFixed(1);
    }
    else {
      this.monthlyAverage = Math.round(this.monthlyAverage);
    }
  }


}
