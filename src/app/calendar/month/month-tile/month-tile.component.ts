import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
} from "@angular/core";
import { ModalDialogOptions, ModalDialogService } from "@nativescript/angular";
import { DataService } from "~/app/data/data.service";
import { ActivitySummary, MonthTileObject } from "../../calendar-data.model";
import { CalendarEntriesService } from "../../calendar-entries.service";
import { DayPopupComponent } from "../../day-popup/day-popup.component";

@Component({
  selector: "Month-Tile",
  templateUrl: "./month-tile.component.html",
})
export class MonthTileComponent implements OnInit {
  @Input() tile: MonthTileObject;
  @Output() refreshAll: EventEmitter<boolean> = new EventEmitter();
  @Output() refreshTile: EventEmitter<boolean> = new EventEmitter();

  public today: Date;
  public tomorrow: Date;
  public earliest: Date;

  public totalDistance: number;

  constructor(
    private _dataService: DataService,
    public entriesService: CalendarEntriesService,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.today = new Date();
    this.tomorrow = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate() + 1
    );
    this.earliest = new Date(this._dataService.getEarliestEntryDay().getTime());
    this.earliest.setDate(this.earliest.getDate() - 1);
    this.earliest.setHours(23, 59, 59);

    this.totalDistance = this.entriesService.polishDistance(
      this.tile.distances.totalRunDistance +
        this.tile.distances.totalWalkDistance
    );
  }

  public showTileDistance(): boolean {
    if (this.earliest < this.tile.date && this.tile.date < this.tomorrow) {
      return true;
    } else {
      return false;
    }
  }

  public getDateStyle(): string {
    //{'color':item.primaryMonth ? 'white' : '#6e6a73' }
    if (this.entriesService.sameDay(this.tile.date, new Date())) {
      return "monthTile today date";
    } else if (!this.tile.primaryMonth) {
      return "monthTile another";
    } else {
      return "monthTile";
    }
  }

  public getDistanceStyle(): string {
    if (
      this.tile.distances.totalRunDistance != 0 ||
      this.tile.distances.totalWalkDistance != 0
    ) {
      return "distance goalMet";
    } else {
      return "distance none";
    }
  }

  dayTap() {
    let earliestEntryDay = this._dataService.getEarliestEntryDay();
    let originalDistance: ActivitySummary;
    if (this.tile.distances) {
      originalDistance = Object.assign({}, this.tile.distances);
    } else {
      originalDistance = {
        date: this.tile.date,
        totalWalkDistance: 0,
        totalRunDistance: 0,
      };
    }

    let refresh: boolean =
      !this.entriesService.sameDay(earliestEntryDay, this.tile.date) &&
      this.tile.date < earliestEntryDay;

    let options: ModalDialogOptions = {
      context: { tile: this.tile },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService.showModal(DayPopupComponent, options).then(() => {
      // Getting the tile update
      this.tile.distances = this.entriesService.groupDataByDay(
        this.tile.date,
        this.tile.date
      )[0];

      if (!this.tile.distances) {
        this.tile.distances = {
          date: this.tile.date,
          totalWalkDistance: 0,
          totalRunDistance: 0,
        };

        console.log("tile distances empty  " + this.tile.distances);
      }

      if (refresh && originalDistance != this.tile.distances) {
        this.refreshAll.emit(true);
      } else if (originalDistance != this.tile.distances) {
        this.totalDistance = this.entriesService.polishDistance(
          this.tile.distances.totalRunDistance +
            this.tile.distances.totalWalkDistance
        );
      }
    });
  }
}
