import { Injectable } from "@angular/core";
import { DistanceData } from "~/app/data/data.model";
import { DataService } from "~/app/data/data.service";
import {
  ActivitySummary,
  MonthMap,
  MonthTileObject,
} from "./calendar-data.model";

@Injectable({
  providedIn: "root",
})
export class CalendarEntriesService {
  private _monthMap: MonthMap[] = [
    { index: 0, name: "January" },
    { index: 1, name: "February" },
    { index: 2, name: "March" },
    { index: 3, name: "April" },
    { index: 4, name: "May" },
    { index: 5, name: "June" },
    { index: 6, name: "July" },
    { index: 7, name: "August" },
    { index: 8, name: "September" },
    { index: 9, name: "October" },
    { index: 10, name: "November" },
    { index: 11, name: "December" },
  ];

  public today: Date = new Date();
  public year: number = this.today.getFullYear();
  public month: number = this.today.getMonth();
  public currentMonth: MonthMap;

  public displayData: DistanceData[] = [];
  private _activeMonths: { month: number; year: number }[] = [];

  constructor(private _dataService: DataService) {
    this.currentMonth = this._monthMap.find((m) => m.index === +this.month);
  }

  public get activeMonths() {
    let copy: { month: number; year: number }[] = [];
    this._activeMonths.forEach((x) => {
      copy.push({ month: x.month, year: x.year });
    });
    return copy;
  }

  initMonths(): MonthTileObject[][] {
    let initMonthSet: MonthTileObject[][] = [];
    this._activeMonths = [];

    var startMonthDate = new Date();

    var newMonth = startMonthDate.getMonth();
    var newYear = startMonthDate.getFullYear();

    this._activeMonths.push({ month: newMonth, year: newYear });
    initMonthSet.push(this.setupMonthTiles(newMonth, newYear));
    newMonth++;

    return initMonthSet;
  }

  setupMonthTiles(inputMonth: number, inputYear: number): MonthTileObject[] {
    console.log("inputMonth" + inputMonth);
    console.log("inputYear" + inputYear);

    let firstDayMonth: Date = new Date(inputYear, inputMonth, 1);
    let lastDayMonth: Date = new Date(inputYear, inputMonth + 1, 0);

    let firstDay: Date = new Date(
      inputYear,
      inputMonth,
      firstDayMonth.getDate() - firstDayMonth.getDay()
    ); //First tile
    let extraEndDays: number =
      42 - lastDayMonth.getDate() - firstDayMonth.getDay(); // Number of days of the next month required to fill out the grid
    let lastDay: Date = new Date(
      inputYear,
      inputMonth,
      lastDayMonth.getDate() + extraEndDays
    );

    //Finding all entries for the current month
    let AllDataCopy: DistanceData[] = this._dataService.getAllData();

    if (AllDataCopy) {
    }
    this.displayData = AllDataCopy.filter(
      (data) => data.date.getMonth() === inputMonth
    );

    var tempDaysOfMonth: Date[] = [];
    var nextDate: Date = new Date(firstDay.getTime());

    while (nextDate < lastDay) {
      tempDaysOfMonth.push(new Date(nextDate.getTime()));
      nextDate.setDate(nextDate.getDate() + 1);
    }
    tempDaysOfMonth.push(new Date(nextDate.getTime()));

    var tempMonthTileList: MonthTileObject[] = [];
    var currentMonthGroupedData: ActivitySummary[] = this.groupDataByDay(
      firstDay,
      lastDay
    );

    var currentRow: number = 2; // Row for the GridLayout in MonthComponent

    tempDaysOfMonth.forEach((day, index) => {
      if (day.getDay() === 0 && index > 6) {
        currentRow = currentRow + 1;
      }

      let thisDaysDistance: ActivitySummary = currentMonthGroupedData.find(
        (data) => this.sameDay(data.date, day)
      );

      if (!thisDaysDistance) {
        thisDaysDistance = {
          date: day,
          totalWalkDistance: 0,
          totalRunDistance: 0,
        }; // If there is no data for the given day, the distances are set to 0
      }

      let primary: boolean = day.getMonth() === inputMonth ? true : false;

      tempMonthTileList.push({
        date: day,
        //distanceData: thisDaysDistance,
        distances: thisDaysDistance,
        column: day.getDay(),
        row: currentRow,
        month: this._monthMap.find((m) => m.index === inputMonth).name,
        year: inputYear,
        primaryMonth: primary,
      });
    });

    return tempMonthTileList;
  }

  // Summarizes the total distances for each day in the provided range
  public groupDataByDay(startDate: Date, endDate: Date): ActivitySummary[] {
    let dayGroupedData: ActivitySummary[] = [];

    let filteredData: DistanceData[] = this._dataService
      .getAllData()
      .filter((data) => startDate <= data.date && data.date <= endDate);

    filteredData.forEach((data) => {
      let dayExistsSearch: ActivitySummary = dayGroupedData.find((d) =>
        this.sameDay(d.date, data.date)
      ); // Checking if this date already exists in dayGroupedData

      if (dayExistsSearch) {
        // If the day already exists in dayGroupedData, add the distances of this data object to the existing entry for that day
        let index: number = dayGroupedData.indexOf(dayExistsSearch);
        if (data.activity === "run") {
          dayGroupedData[index].totalRunDistance += data.distance;
        }
        if (data.activity === "walk") {
          dayGroupedData[index].totalRunDistance += data.distance;
        }
      } else {
        let runDistance: number;
        let walkDistance: number;
        if (data.activity === "run") {
          runDistance = data.distance;
          walkDistance = 0;
        }
        if (data.activity === "walk") {
          runDistance = 0;
          walkDistance = data.distance;
        }

        dayGroupedData.push({
          date: data.date,
          totalRunDistance: runDistance,
          totalWalkDistance: walkDistance,
        });
      }
    });

    return dayGroupedData;
  }

  public totalDistanceForDay(day: Date): number {
    let allEntriesForDay: DistanceData[] = this._dataService
      .getAllData()
      .filter((x) => this.sameDay(x.date, day));
    let total: number = 0;
    allEntriesForDay.forEach((x) => (total += x.distance));

    return total;
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

  public polishDistance(distance: number): number {
    // Distances are stored in km by default
    // This converts the raw distances into miles if the user has selected miles
    // and rounds the numbers to display on the calendar

    let conversion: number = distance;

    if (this._dataService.unit === "mi" || this._dataService.unit === "miles") {
      conversion = this._dataService.convertToMi(distance);
    }

    return parseFloat(conversion.toFixed(1));
  }
}
