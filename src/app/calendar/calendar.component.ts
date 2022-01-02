import {
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  Frame,
  Label,
  ListView,
  ScrollEventData,
  ScrollView,
  SwipeGestureEventData,
  TouchGestureEventData,
  View,
} from "@nativescript/core";
import { MonthTileObject } from "./calendar-data.model";
import { CalendarEntriesService } from "./calendar-entries.service";
import { MonthComponent } from "./month/month.component";

@Component({
  selector: "Calendar",
  templateUrl: "./calendar.component.html",
})
export class CalendarComponent implements OnInit {
  public scrollView: ScrollView;
  private _scrollInit: boolean = false;
  public scrollX: number;
  public defaultXCoord: number = 1;
  public rightMost: number = 2;
  public leftMost: number = 1;
  public touchPointX: number;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  public activeMonths: { month: number; year: number }[];
  public monthSet: MonthTileObject[][];
  @ViewChild("months", { read: ViewContainerRef }) container: ViewContainerRef;
  public MonthInstances: ComponentRef<MonthComponent>[];
  private _factory: ComponentFactory<MonthComponent>;
  private _disableLoadPrevious: boolean = false;
  private _disableLoadNext: boolean = false;

  constructor(
    private _entriesService: CalendarEntriesService,
    private _resolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.resetMonths();
  }

  ngAfterViewInit(): void {
    this._factory = this._resolver.resolveComponentFactory(MonthComponent);
    this.refreshMonthInstances();
  }

  public resetMonths() {
    this.monthSet = this._entriesService.initMonths();
    this.activeMonths = this._entriesService.activeMonths;
    this.refreshMonthInstances();
  }

  public refreshMonthInstances() {
    this.MonthInstances = [];
    this.container.clear();

    this.monthSet.forEach((m) => {
      const month = this.container.createComponent(this._factory);
      month.instance.daysOfMonth = m;
      month.changeDetectorRef.detectChanges();

      this.MonthInstances.push(month);

      month.instance.refreshAll.subscribe((refreshAll) => {
        if (refreshAll) {
          console.log("refreshing emitted");

          let refreshedMonthSet: MonthTileObject[][] = [];
          this.monthSet.forEach((m) => {
            refreshedMonthSet.push(
              this._entriesService.setupMonthTiles(
                m[15].date.getMonth(),
                m[15].year
              )
            );
          });
          this.monthSet = refreshedMonthSet;
          this.refreshMonthInstances();
        }
      });
    });
  }

  public onScroll(args: ScrollEventData) {
    if (!this._scrollInit) {
      this.scrollView = args.object as ScrollView;
    }
    this._scrollInit = true;
    this.scrollX = args.scrollX;
  }

  public async onSwipe(args: SwipeGestureEventData) {
    if (this.scrollX > this.rightMost) {
      // Loading next
      if (!this._disableLoadPrevious) {
        this.loading.emit(true);
        await this.sleep(20);

        this._disableLoadPrevious = true;
        await this.sleep(10).then((x) => {
          let lastMonth: { month: number; year: number } =
            this.activeMonths[this.activeMonths.length - 1];
          let nextMonthDate = new Date(lastMonth.year, lastMonth.month, 1);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
          let newMonth = nextMonthDate.getMonth();
          let newYear = nextMonthDate.getFullYear();

          this.activeMonths.push({ month: newMonth, year: newYear });
          this.monthSet.push(
            this._entriesService.setupMonthTiles(newMonth, newYear)
          );

          //removing earliest month
          if (this.activeMonths.length > 3) {
            console.log("removed first");
            this.activeMonths.splice(0, 1);
            this.monthSet.splice(0, 1);
          }

          if (this.activeMonths.length > 1 && this.activeMonths.length < 4) {
            this.rightMost = (this.activeMonths.length - 1) * 396;
          } else {
            this.rightMost = 2;
          }

          this.refreshMonthInstances();
        });
        this.loading.emit(false);
        await this.sleep(20);
        this.scrollView.scrollToHorizontalOffset(this.rightMost, false);
        await this.sleep(10).then((x) => this.loading.emit(false));
        await this.sleep(1000).then((x) => {
          this._disableLoadPrevious = false;
          console.log("_disableLoadPrevious+ " + this._disableLoadPrevious);
        });
      }
    }

    if (this.scrollX < this.leftMost) {
      // Loading previous month
      if (!this._disableLoadNext) {
        this.loading.emit(true);
        await this.sleep(20);

        this._disableLoadNext = true;
        console.log("disable load next+ " + this._disableLoadNext);
        await this.sleep(10).then((x) => {
          //Getting first month of ActiveMonths
          let firstMonth: { month: number; year: number } =
            this.activeMonths[0];

          //Getting the month previous to firstMonth
          let nextMonthDate = new Date(firstMonth.year, firstMonth.month, 1);
          nextMonthDate.setMonth(nextMonthDate.getMonth() - 1);
          let newMonth = nextMonthDate.getMonth();
          let newYear = nextMonthDate.getFullYear();

          //Adding previous month to ActiveMonths at index 0
          this.activeMonths.splice(0, 0, { month: newMonth, year: newYear });
          this.monthSet.splice(
            0,
            0,
            this._entriesService.setupMonthTiles(newMonth, newYear)
          );

          //removing latest month
          if (this.activeMonths.length > 3) {
            this.activeMonths.pop();
            this.monthSet.pop();
          }

          this.refreshMonthInstances();
        });

        this.loading.emit(false);
        await this.sleep(20);
        this.scrollView.scrollToHorizontalOffset(1, false);
        await this.sleep(10).then((x) => this.loading.emit(false));
        await this.sleep(1000).then((x) => {
          this._disableLoadNext = false;
          console.log("disable load next+ " + this._disableLoadNext);
        });
      }
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
