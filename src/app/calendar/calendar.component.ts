import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { ScrollEventData, ScrollView, SwipeGestureEventData } from '@nativescript/core';
import { MonthTileObject } from './calendar-data.model';
import { CalendarEntriesService } from './calendar-entries.service';


@Component({
  selector: 'Calendar',
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {

  public activeMonths: {month: number, year: number} [];
  public monthSet: MonthTileObject[][];
  scrollView: ScrollView;
  private _scrollInit: boolean = false;
  public scrollX: number;
  public defaultXCoord: number = 425;
  public nextMonthXCoord: number = 840;
  public previousMonthXCoord: number = 10;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  constructor(private _entriesService: CalendarEntriesService){}

  ngOnInit(): void {
    this.resetMonths()
    }

  public resetMonths(){
    this.monthSet = this._entriesService.initMonths();
    this.activeMonths = this._entriesService.activeMonths;
  }

  public onScroll(args: ScrollEventData) {
    if(!this._scrollInit){
        this.scrollView = args.object as ScrollView;
        this.scrollView.scrollToHorizontalOffset(this.defaultXCoord, true);
    }
    this._scrollInit = true;
    this.scrollX = args.scrollX;

    }

  public async onSwipe(args: SwipeGestureEventData) {
    this.loading.emit(true);
    await this.sleep(10).then()

    switch(+args.direction){
      case 2: // swipe left -- getting next month
        {
          if (this.scrollX > 851){
   
            let lastMonth: {month: number, year: number} = this.activeMonths[this.activeMonths.length-1];
            let nextMonthDate = new Date(lastMonth.year, lastMonth.month, 1);
            nextMonthDate.setMonth(nextMonthDate.getMonth()+1);
            let newMonth = nextMonthDate.getMonth();
            let newYear = nextMonthDate.getFullYear();
          
            this.activeMonths.push({month: newMonth, year: newYear});
            this.monthSet.push(this._entriesService.setupMonthTiles(newMonth, newYear));

            //removing earliest month
            this.activeMonths.splice(0, 1);
            this.monthSet.splice(0, 1);
   

            this.loading.emit(false)
            await this.sleep(20);
            this.scrollView.scrollToHorizontalOffset(this.nextMonthXCoord-200, true);
            await this.sleep(30);
            this.scrollView.scrollToHorizontalOffset(this.nextMonthXCoord, true);
            await this.sleep(30);
          
          }
        }
      case 1: // swipe right  -- getting previous month
        {
          if (this.scrollX < 1){
 
            //Getting first month of ActiveMonths
            let firstMonth: {month: number, year: number} = this.activeMonths[0];

            //Getting the month previous to firstMonth
            let nextMonthDate = new Date(firstMonth.year, firstMonth.month, 1);
            nextMonthDate.setMonth(nextMonthDate.getMonth()-1);
            let newMonth = nextMonthDate.getMonth();
            let newYear = nextMonthDate.getFullYear();

            //Adding previous month to ActiveMonths at index 0
            this.activeMonths.splice(0, 0, {month: newMonth, year: newYear});
            this.monthSet.splice(0, 0, this._entriesService.setupMonthTiles(newMonth, newYear));

            //removing latest month
            this.activeMonths.pop();
            this.monthSet.pop();


            this.loading.emit(false)
            await this.sleep(20);
            this.scrollView.scrollToHorizontalOffset(this.previousMonthXCoord+200, true);
            await this.sleep(30);
            this.scrollView.scrollToHorizontalOffset(this.previousMonthXCoord, true);
            await this.sleep(30);
          }

        }
      default: {this.loading.emit(false);}
      }

      this.loading.emit(false);

  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}