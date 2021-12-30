import { Injectable } from '@angular/core';
import { DistanceData } from '~/app/data/data.model';
import { DataService } from '~/app/data/data.service';
import { MonthMap, MonthTileObject } from './calendar-data.model';


@Injectable({
        providedIn: 'root',
      })

export class CalendarEntriesService {
        private _monthMap: MonthMap[] = [
                {index: 0, name: "January"},
                {index: 1, name: "February"},
                {index: 2, name: "March"},
                {index: 3, name: "April"},
                {index: 4, name: "May"},
                {index: 5, name: "June"},
                {index: 6, name: "July"},
                {index: 7, name: "August"},
                {index: 8, name: "September"},
                {index: 9, name: "October"},
                {index: 10, name: "November"},
                {index: 11, name: "December"},
            ];

        public today: Date = new Date();
        public year: number = this.today.getFullYear();
        public month: number = this.today.getMonth();
        public currentMonth: MonthMap ;
      
        public displayData: DistanceData[] = [];
     //   private _initMonthSet: MonthTileObject[][] = [];
        private _activeMonths: {month: number, year: number}[] = [];
    

        constructor(private _dataService: DataService){
              //  this.initMonths();
                this.currentMonth = this._monthMap.find(m => m.index === +this.month);
        }

    /*     public get initMonthSet() {
                let copy: MonthTileObject[][] = []
                this._initMonthSet.forEach(x => {copy.push(x)});
                return copy;
        } */

         public get activeMonths() {
                let copy:{month: number, year: number}[] = []
                this._activeMonths.forEach(x => {copy.push({month: x.month, year: x.year})});
                return copy;
        }  

        initMonths(): MonthTileObject[][] {
              
                let initMonthSet: MonthTileObject[][] = [];
                this._activeMonths = [];

                // initMonthSet array will hold last month, this month, and next month
                // Getting last month first
                var startMonthDate = new Date();
                startMonthDate.setMonth(startMonthDate.getMonth()-1);
                var newMonth = startMonthDate.getMonth();
                var newYear = startMonthDate.getFullYear();


                //Starting with last month, pushing months to ActiveMonths
                for (let x = 0; x < 3; x++) {
                
                        if (newMonth > 11){
                                newMonth = 0;
                                newYear++;
                        }

                        this._activeMonths.push({month: newMonth, year: newYear});
                        initMonthSet.push(this.setupMonthTiles(newMonth, newYear));
                        newMonth++;
                }

                return initMonthSet;
        }

        setupMonthTiles(inputMonth: number, inputYear: number): MonthTileObject[]{

                console.log("inputMonth"+inputMonth);
                console.log("inputYear"+inputYear);
             
                let firstDayMonth: Date = new Date(inputYear, inputMonth, 1);
                let lastDayMonth: Date = new Date(inputYear, inputMonth+1, 0);

                let firstDay: Date = new Date(inputYear, inputMonth, firstDayMonth.getDate()-(firstDayMonth.getDay())); //First tile
                let extraEndDays: number = 42-(lastDayMonth.getDate())-(firstDayMonth.getDay()); // Number of days of the next month required to fill out the grid
                let lastDay: Date = new Date (inputYear, inputMonth, lastDayMonth.getDate()+extraEndDays);

                //Finding all entries for the current month
                let AllDataCopy: DistanceData[] = this._dataService.getAllData();
         
                if (AllDataCopy){}
                this.displayData = AllDataCopy.filter(data => data.date.getMonth() === inputMonth);
        
                var tempDaysOfMonth: Date[] = [];
                var nextDate: Date = new Date(firstDay.getTime());
           
                while (nextDate < lastDay) {
                    tempDaysOfMonth.push(new Date(nextDate.getTime()));
                    nextDate.setDate(nextDate.getDate()+1);
                } 
                tempDaysOfMonth.push(new Date(nextDate.getTime()));
        
                var tempMonthTileList: MonthTileObject[] = [];
                var currentMonthGroupedData: DistanceData[] = this.groupDataByDay(firstDay, lastDay);

                var currentRow: number = 2; // Row for the GridLayout in MonthComponent

                tempDaysOfMonth.forEach((day, index) => {

                    if(day.getDay() === 0 && index > 6)
                    { currentRow = currentRow+1; } 

                    let thisDaysDistance: DistanceData = currentMonthGroupedData.find(data => this.sameDay(data.date, day));
                    if (!thisDaysDistance){
                        thisDaysDistance = ({date: day, distance: 0}); // If there is no data for the given day, the distance is set to 0
                    }
                    let primary: boolean = day.getMonth() === inputMonth? true : false;

                        tempMonthTileList.push({
                            date: day,
                            distanceData: thisDaysDistance,
                            column: day.getDay(),
                            row: currentRow,
                            month: this._monthMap.find(m => m.index === inputMonth).name,
                            year: inputYear,
                            primaryMonth: primary
                        })
                });
        
                return tempMonthTileList;
                
            }
   

        public groupDataByDay(startDate: Date, endDate: Date): DistanceData[] {
                let dayGroupedData: DistanceData[] = [];

                let filteredData: DistanceData[] = this._dataService.getAllData().filter(data => (startDate <= data.date) && (data.date <= endDate));

                filteredData.forEach((data) => {

                        let dayExistsSearch: DistanceData = dayGroupedData.find(d => this.sameDay(d.date, data.date)); // Checking if this date already exists in dayGroupedData
                        
                        if (dayExistsSearch){  // If the day already exists in dayGroupedData, add the distance of this data object to the existing entry for that day
                                let index: number = dayGroupedData.indexOf(dayExistsSearch);
                                dayGroupedData[index].distance = dayGroupedData[index].distance + data.distance;
                        }
                        else {
                                dayGroupedData.push(data);
                        }
                });

                return dayGroupedData;
        }

        public sameDay(date1: Date, date2: Date): boolean {
                if(date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()){
                        return true;
                }
                else {
                        return false;
                }

                }

}