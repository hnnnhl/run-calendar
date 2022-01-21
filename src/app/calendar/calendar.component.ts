import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";

import { DataService } from "../data/data.service";
import { MonthObject, MonthTileObject } from "./calendar-data.model";
import { CalendarEntriesService } from "./calendar-entries.service";
import { MonthComponent } from "./month/month.component";

@Component({
  selector: "Calendar",
  templateUrl: "./calendar.component.html",
})
export class CalendarComponent implements OnInit {
/*   public scrollView: ScrollView;
  private _scrollInit: boolean = false;
  public scrollX: number;
  public defaultXCoord: number = 1;
  public rightMost: number = 2;
  public leftMost: number = 1;
  public touchPointX: number; */

  @Output() loading: EventEmitter<boolean> = new EventEmitter();

 // public activeMonths: { month: number; year: number }[];
  public activeMonth: MonthObject;
  @ViewChild("months", { read: ViewContainerRef }) container: ViewContainerRef;
  private _factory: ComponentFactory<MonthComponent>;

  //private _monthCache: MonthObject[] = [];
 // private _MonthInstanceCache: ComponentRef<MonthComponent>[];
  private _today: Date = new Date();
  private _thisMonth: number = this._today.getMonth();
  private _thisYear: number = this._today.getFullYear();

  constructor(
    private _entriesService: CalendarEntriesService,
    private _resolver: ComponentFactoryResolver,
    private _dataService: DataService
  ) {}

  ngOnInit(): void {
    this.resetMonths();
  }

  ngAfterViewInit(): void {
    this._factory = this._resolver.resolveComponentFactory(MonthComponent);

    if (this.container){
      this.resetMonths();
    }
  }

  private _setupMonth(inputMonth: number, inputYear: number){
    let monthSearch: MonthObject = this._entriesService.monthCache.find(m => m.month === inputMonth && m.year === inputYear);
    if (monthSearch){
      this.activeMonth = monthSearch;

    } 
    else {
      let newMonth = this._entriesService.setupMonthTiles(inputMonth, inputYear);
      this._entriesService.monthCache.push(newMonth);
      this.activeMonth = newMonth;
    }

  }

  public resetMonths() {
    this._setupMonth(this._thisMonth, this._thisYear);
    this.refreshMonthInstances();
  }

  public refreshMonthInstances() {
    this.container.clear();

    const month = this.container.createComponent(this._factory);
    month.instance.monthObject = this.activeMonth;
    month.changeDetectorRef.detectChanges();

    month.instance.refreshAll.subscribe((refreshAll) => {
        if (refreshAll) {
        
          this.activeMonth = this._entriesService.setupMonthTiles(this.activeMonth.month, this.activeMonth.year);
          let mIndex: number  = this._entriesService.monthCache.findIndex(m => m.year === this.activeMonth.year && m.month === this.activeMonth.month);
          this._entriesService.monthCache.splice(mIndex, 1);
          this.refreshMonthInstances();
          this._dataService.distancesUpdated = false; // Resetting
          this._dataService.goalsUpdated = false; // Resetting
        }
      });

    //this._MonthInstanceCache.push(month);
  }

  async nextMonth(){
    this.loading.emit(true);

      await this.sleep(10).then((x) => {
        let newMonth = this.activeMonth.month + 1;
        let newYear = this.activeMonth.year;

        if (newMonth > 11) {
          newMonth = 0;
          newYear++;
        }

        this._setupMonth(newMonth, newYear);
        this.refreshMonthInstances();
      });
      this.loading.emit(false);
  }

  async previousMonth(){
    this.loading.emit(true);
    await this.sleep(10).then((x) => {

      let newMonth = this.activeMonth.month - 1;
      let newYear = this.activeMonth.year;

      if (newMonth < 0) {
          newMonth = 11;
          newYear--;
        }
      this._setupMonth(newMonth, newYear);

      this.refreshMonthInstances();
    });

    this.loading.emit(false)
  
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }



}
