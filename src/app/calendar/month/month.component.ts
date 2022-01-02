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
import { ListPickerPopupComponent } from "~/app/shared/list-picker-popup/list-picker-popup.component";
import {
  ActivitySummary,
  MonthMap,
  MonthTileObject,
} from "../calendar-data.model";
import { CalendarEntriesService } from "../calendar-entries.service";
import { DayPopupComponent } from "../day-popup/day-popup.component";
import { MonthTileComponent } from "./month-tile/month-tile.component";

@Component({
  selector: "Month",
  templateUrl: "./month.component.html",
})
export class MonthComponent implements OnInit, AfterViewInit {
  @Input() month: number;
  @Input() year: number;
  @Input() daysOfMonth: MonthTileObject[];

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
      this.daysOfMonth = this.entriesService.setupMonthTiles(
        this.month,
        this.year
      );
    } else {
      // Picking a date in the middle of daysOfMonth to ensure the date is in the primary month
      this.month = this.daysOfMonth[15].date.getMonth();
      this.year = this.daysOfMonth[15].date.getFullYear();
    }

    this.currentMonth = this.entriesService.currentMonth;
  }

  ngAfterViewInit() {
    this._factory = this._resolver.resolveComponentFactory(MonthTileComponent);
    this.refreshTileInstances();
  }

  refreshTileInstances() {
    this.TileInstances = [];
    //this.container.clear();

    this.daysOfMonth.forEach((d) => {
      const day = this.container.createComponent(this._factory);
      day.instance.tile = d;
      day.changeDetectorRef.detectChanges();

      this.TileInstances.push(day);

      day.instance.refreshAll.subscribe((refreshAll) => {
        if (refreshAll) {
          console.log("needs refresh");
          this.refreshAll.emit(true);
        }
      });
    });
  }

  refreshTile(tileComponent: ComponentRef<MonthTileComponent>) {
    // Updating tile with new distance
    // If a date is provided, only updating tile for that date
    let dateUpdated = tileComponent.instance.tile.date;
    let dayTile: MonthTileObject = this.daysOfMonth.find((x) =>
      this.entriesService.sameDay(x.date, dateUpdated)
    );

    let dayIndex: number = this.daysOfMonth.indexOf(dayTile);

    let distances: ActivitySummary = this.entriesService.groupDataByDay(
      dateUpdated,
      dateUpdated
    )[0];

    this.daysOfMonth[dayIndex].distances = distances;

    tileComponent.instance.tile.distances = distances;
    tileComponent.changeDetectorRef.detectChanges();
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
