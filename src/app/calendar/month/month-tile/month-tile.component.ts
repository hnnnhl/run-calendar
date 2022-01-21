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

  public today: Date;
  public tomorrow: Date;
  public earliest: Date;

  public totalDistance: number;
/*   public totalGoalDistance: number; */

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

    if (!this.tile.distances) {
      this.tile.distances = {
        date: this.tile.date,
        totalWalkDistance: 0,
        totalRunDistance: 0,
      };
    }

/*     if (!this.tile.goals) {
      this.tile.goals = {
        date: this.tile.date,
        totalWalkDistance: 0,
        totalRunDistance: 0,
      };
    } */

    this.totalDistance = this.entriesService.polishDistance(
      this.tile.distances.totalRunDistance +
        this.tile.distances.totalWalkDistance
    );

/*     this.totalGoalDistance = this.entriesService.polishDistance(
      this.tile.goals.totalRunDistance +
        this.tile.goals.totalWalkDistance
    ); */

    

  }

  public showTileDistance(): boolean {
    if (this.earliest < this.tile.date && this.tile.date < this.tomorrow) {
      return true;
    } 
    else {
      return false;
    }
  }
  
/*   public showGoal(): boolean {
    if (this.today < this.tile.date && this.totalGoalDistance > 0) {
      return true;
    } 
    else {
      return false;
    }
  }
 */
  public getDateStyle(): string {
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

  public dayTap() {
    let earliestEntryBeforeOpen = this._dataService.getEarliestEntryDay();

    let options: ModalDialogOptions = {
      context: { tile: this.tile },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService.showModal(DayPopupComponent, options).then(() => {
          let earliestEntryAfterOpen = this._dataService.getEarliestEntryDay();

          let refreshEntryDelete: boolean =
            !this.entriesService.sameDay(earliestEntryAfterOpen, this.tile.date) &&
            this.tile.date < earliestEntryAfterOpen;
          
          let refreshEntryAdd: boolean =
            !this.entriesService.sameDay(earliestEntryBeforeOpen, this.tile.date) &&
            this.tile.date < earliestEntryBeforeOpen;

          let distancesUpdated: boolean = this._dataService.distancesUpdated; 
          let goalsUpdated: boolean = this._dataService.goalsUpdated;

          if (refreshEntryDelete || refreshEntryAdd && (distancesUpdated || goalsUpdated)) {
              this.refreshAll.emit(true);   
          } 
          else if (distancesUpdated) {
            let distanceGroup: ActivitySummary = this.entriesService.groupDataByDay(
              this.tile.date,
              this.tile.date
            )[0];
      
            if (distanceGroup) {
              this.tile.distances = distanceGroup;
            } 
            else {
              this.tile.distances = {
              date: this.tile.date,
              totalWalkDistance: 0,
              totalRunDistance: 0,
              }
            }

            this.totalDistance = this.entriesService.polishDistance(
              this.tile.distances.totalRunDistance +
                this.tile.distances.totalWalkDistance
            );
          }
          else if (goalsUpdated) {

            let goalDayEnd: Date = new Date(this.tile.date.getTime());
            goalDayEnd.setDate(goalDayEnd.getDate()+1);
            goalDayEnd.setMilliseconds(goalDayEnd.getMilliseconds()-1);
      
            let goalGroup: ActivitySummary = this.entriesService.groupGoalsByDay(
              this.tile.date,
              goalDayEnd
            )[0];

            if (goalGroup) {
              this.tile.goals = goalGroup;
            }
            else {
              this.tile.goals = {
              date: this.tile.date,
              totalWalkDistance: 0,
              totalRunDistance: 0,
              }
            }
      /*       this.totalGoalDistance = this.entriesService.polishDistance(
              this.tile.goals.totalRunDistance +
                this.tile.goals.totalWalkDistance
            ); */
        
        }
      }); 
    }
}
