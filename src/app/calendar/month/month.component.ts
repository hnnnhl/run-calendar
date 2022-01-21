import {
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ModalDialogOptions, ModalDialogService } from "@nativescript/angular";
import { ObservableArray, SwipeGestureEventData } from "@nativescript/core";
import { DistanceData } from "~/app/data/data.model";
import { DataService } from "~/app/data/data.service";
import { DatePickerPopupComponent } from "~/app/shared/date-picker-popup/date-picker-popup.component";
import { ListPickerPopupComponent } from "~/app/shared/list-picker-popup/list-picker-popup.component";
import {
  ActivitySummary,
  MonthMap,
  MonthObject,
  MonthTileObject,
} from "../calendar-data.model";
import { CalendarEntriesService } from "../calendar-entries.service";
import { DayPopupComponent } from "../day-popup/day-popup.component";
import { MonthTileComponent } from "./month-tile/month-tile.component";
import { RadListView, ListViewScrollEventData } from "nativescript-ui-listview";

@Component({
  selector: "Month",
  templateUrl: "./month.component.html",
})
export class MonthComponent implements OnInit, AfterViewInit {
  @Input() month: number;
  @Input() year: number;
  @Input() monthObject: MonthObject;

  @ViewChild("tiles", { read: ViewContainerRef }) container: ViewContainerRef;
  private _factory: ComponentFactory<MonthTileComponent>;
  public TileInstances: ComponentRef<MonthTileComponent>[];

  @Output() refreshAll: EventEmitter<boolean> = new EventEmitter();

  public currentMonth: MonthMap;
  // public currentRow: number = 2;

  public today: Date;
  public tomorrow: Date;
  public earliest: Date;

  constructor(
    private _dataService: DataService,
    public entriesService: CalendarEntriesService,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef,
    private _resolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    if (this.month && this.year) {
      this.monthObject = this.entriesService.setupMonthTiles(
        this.month,
        this.year
      );
    } else {
      // Picking a date in the middle of daysOfMonth to ensure the date is in the primary month
      this.month = this.monthObject.month;
      this.year = this.monthObject.year;
    }

    this.currentMonth = this.entriesService.currentMonth;
  }

  ngAfterViewInit() {
    this._factory = this._resolver.resolveComponentFactory(MonthTileComponent);

    if (this.container){
      this.refreshTileInstances();
    }
  }

  refreshTileInstances() {
    this.TileInstances = [];
    this.container.clear();

    this.monthObject.tiles.forEach((d) => {
      const day = this.container.createComponent(this._factory);
      day.instance.tile = d;
      day.changeDetectorRef.detectChanges();

      this.TileInstances.push(day);

      day.instance.refreshAll.subscribe((refreshAll) => {
        if (refreshAll) {
          this.refreshAll.emit(true);
        }
      });
    });
  }

  selectMonth(){
    let options: ModalDialogOptions = {
      context: { },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService.showModal(DatePickerPopupComponent, options).then(() => {});
  }

  
  public showTileDistance(tile: MonthTileObject): boolean {
    if (this.earliest < tile.date && tile.date < this.tomorrow) {
      return true;
    } 
    else {
      return false;
    }
  }

  public getDateStyle(tile: MonthTileObject): string {
    if (this.entriesService.sameDay(tile.date, new Date())) {
      return "monthTile today date";
    } else if (!tile.primaryMonth) {
      return "monthTile another";
    } else {
      return "monthTile";
    }
  }

  public getDistanceStyle(tile: MonthTileObject): string {
    if (
      tile.distances.totalRunDistance != 0 ||
      tile.distances.totalWalkDistance != 0
    ) {
      return "distance goalMet";
    } else {
      return "distance none";
    }
  }

  public getTotalDistance(tile: MonthTileObject): number{
    return this.entriesService.polishDistance(tile.distances.totalRunDistance + tile.distances.totalWalkDistance);
  }

  public dayTap(tile: MonthTileObject) {
    let totalDistance: number = this.getTotalDistance(tile);
    let earliestEntryBeforeOpen = this._dataService.getEarliestEntryDay();

    let options: ModalDialogOptions = {
      context: { tile: tile },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService.showModal(DayPopupComponent, options).then(() => {
          let earliestEntryAfterOpen = this._dataService.getEarliestEntryDay();

          let refreshEntryDelete: boolean =
            !this.entriesService.sameDay(earliestEntryAfterOpen, tile.date) &&
            tile.date < earliestEntryAfterOpen;
          
          let refreshEntryAdd: boolean =
            !this.entriesService.sameDay(earliestEntryBeforeOpen, tile.date) &&
            tile.date < earliestEntryBeforeOpen;

          let distancesUpdated: boolean = this._dataService.distancesUpdated; 
          let goalsUpdated: boolean = this._dataService.goalsUpdated;

          if (refreshEntryDelete || refreshEntryAdd && (distancesUpdated || goalsUpdated)) {
              this.refreshAll.emit(true);   
          } 
          else if (distancesUpdated) {
            let distanceGroup: ActivitySummary = this.entriesService.groupDataByDay(
              tile.date,
              tile.date
            )[0];
      
            if (distanceGroup) {
              tile.distances = distanceGroup;
            } 
            else {
              tile.distances = {
              date: tile.date,
              totalWalkDistance: 0,
              totalRunDistance: 0,
              }
            }

            totalDistance = this.entriesService.polishDistance(
              tile.distances.totalRunDistance +
                tile.distances.totalWalkDistance
            );
          }
          else if (goalsUpdated) {

            let goalDayEnd: Date = new Date(tile.date.getTime());
            goalDayEnd.setDate(goalDayEnd.getDate()+1);
            goalDayEnd.setMilliseconds(goalDayEnd.getMilliseconds()-1);
      
            let goalGroup: ActivitySummary = this.entriesService.groupGoalsByDay(
              tile.date,
              goalDayEnd
            )[0];

            if (goalGroup) {
              tile.goals = goalGroup;
            }
            else {
              tile.goals = {
              date: tile.date,
              totalWalkDistance: 0,
              totalRunDistance: 0,
              }
            }

        }
      }); 
    }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
