import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewContainerRef,
} from "@angular/core";
import {
  ModalDialogOptions,
  ModalDialogParams,
  ModalDialogService,
} from "@nativescript/angular";
import { Page } from "@nativescript/core";
import { DistanceData, Goal, DataObject } from "~/app/data/data.model";
import { DataService } from "~/app/data/data.service";
import { EntryPopupComponent } from "~/app/shared/entries/entry-popup/entry-popup.component";
import { ListPickerPopupComponent } from "~/app/shared/list-picker-popup/list-picker-popup.component";
import { MonthTileObject } from "../calendar-data.model";
import { CalendarEntriesService } from "../calendar-entries.service";
import { EntryEditPopupComponent } from "../../shared/entries/entry-edit-popup/entry-edit-popup.component";
import { GoalAddPopupComponent } from "~/app/shared/entries/goal-add-popup/goal-add-popup.component";

@Component({
  selector: "Day-Popup",
  templateUrl: "./day-popup.component.html",
})
export class DayPopupComponent implements OnInit {
  public tile: MonthTileObject;
  public entries: DistanceData[];
  public goals: Goal[];
  public entryStrings: string[] = [];

  public day: string;
  public unitMode: string = "original";
  public unitModes: string[] = ["original", "miles", "kilometers"];
  private _lastMode: string = "original";
  public refresh: boolean = false;
  private _today = new Date();
  public future: boolean = false;

  constructor(
    private _page: Page,
    private _params: ModalDialogParams,
    private _dataService: DataService,
    public _entriesService: CalendarEntriesService,
    private _datepipe: DatePipe,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.tile = _params.context.tile;
  }

  ngOnInit(): void {
    this.day = this._datepipe.transform(this.tile.date, "longDate");
    this._getEntries();
    this._getGoals();

    if (this.tile.date > this._today) {
      this.future = true;
    }
  }

  private _getEntries() {
    this.entries = this._dataService
      .getAllDistanceData()
      .filter((data) =>
        this._entriesService.sameDay(data.date, this.tile.date)
      );
  }

  private _getGoals() {
    this.goals = this._dataService
      .getAllGoals()
      .filter((goal) => {
        // If goal.startDate exists
        if (goal.startDate && goal.startDate > new Date (1970, 0, 1)) { 
          // If tile.date is between goal.startDate and goal.date
          if ((goal.startDate < this.tile.date || 
              this._entriesService.sameDay(goal.startDate, this.tile.date)) &&
              ((this.tile.date < goal.date ||
              this._entriesService.sameDay(goal.date, this.tile.date)))) {
                return true;
              }
          else {
            return false;
          }
        }
        else{ // If goal.startDate does not exist, checking if goal.date is the same as tile.date
          if (this._entriesService.sameDay(goal.date, this.tile.date)){
            return true;
          }
          else {
            return false;
          }
        }
      });
  }

  public close() {
    this._params.closeCallback();
  }

  public pickUnits() {
    this._lastMode = this.unitMode;

    let options: ModalDialogOptions = {
      context: {
        list: this.unitModes,
        lastSelected: this.unitMode,
        prompt: "Choose units to display:",
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(ListPickerPopupComponent, options)
      .then((dialogResult: string) => {
        if (dialogResult) {
          this.unitMode = dialogResult;
        }
      });

    this.generateLog();
  }

  generateLog() {
    this.entryStrings = [];
    this.entries.forEach((e) => {
      this.entryStrings.push(this.generateEntryString(e));
    });

  }

  public generateEntryString(data: DataObject) {

    let time: string = "";
    let activity: string = "";
    let goal: boolean = false;

    if ((data as Goal).setDate){ // this will only return true if this data is of type Goal
      activity = data.activity === "run" ? "Run" : "Walk";
      goal = true;
    } else {  // otherwise, this data is of type DistanceData
      activity = data.activity === "run" ? "Ran" : "Walked";
      time = this._datepipe.transform(data.date, "shortTime") + ": ";
    }

    let entry: string;
    let originalEntry = (entry =
      time +
      activity +
      " " +
      data.originalEntry +
      " " +
      (data.originalUnit === "mi"? "miles" : "kilometers"));
    let milesEntry =
      time +
      activity +
      " " +
      this._entriesService.polishDistance(
        this._dataService.convertToMi(data.distance)
      ) +
      " " +
      "miles";
    let kilometersEntry =
      time +
      activity +
      " " +
      this._entriesService.polishDistance(data.distance) +
      " " +
      "kilometers";

    switch (this.unitMode) {
      case "original": {
        entry = originalEntry;
        break;
      }
      case "miles": {
        entry = milesEntry;
        break;
      }
      case "kilometers": {
        entry = kilometersEntry;
        break;
      }
      default: {
        switch (this._lastMode) {
          default:
          case "original": {
            entry = originalEntry;
            break;
          }
          case "miles": {
            entry = milesEntry;
            break;
          }
          case "kilometers": {
            entry = kilometersEntry;
            break;
          }
        }
      }
    }

    if (goal){
      if (((data as Goal).startDate && (data as Goal).startDate > new Date(1970, 0, 1)) &&
          !(this._entriesService.sameDay((data as Goal).startDate, data.date))){ // If data.startDate exists
        let goalDate: string = this._datepipe.transform(data.date, "shortDate");
        entry += " by " + goalDate;
      }  
    }

    return entry;
  }

  public updateEntry(data: DistanceData) {
    let options: ModalDialogOptions = {
      context: {
        date: this.tile.date,
        entry: data
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(EntryPopupComponent, options)
      .then((dialogResult: [number, boolean]) => { //returns array. Index 0 = entry edited, Index 1 = deleted (boolean)
         if (dialogResult) {
           if (dialogResult[1]){ // If the entry was deleted, remove from this popup lists
            let entryIndex: number = this.entries.findIndex(
              (x) => x.id === dialogResult[0]
            );
            this.entries.splice(entryIndex, 1);
            this.refresh = true;
           }
           else if ((dialogResult[0] > 0) && !dialogResult[1]) { 
            this._getEntries();
          }
        } 
      });
  }

  public addEntry() {
    let options: ModalDialogOptions = {
      context: {
        date: this.tile.date
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(EntryPopupComponent, options)
      .then((dialogResult: [number, boolean]) => {
        if (dialogResult[0] === 1) {
          this._getEntries();
        }
      });
  }

  public addGoal() {
    let options: ModalDialogOptions = {
      context: {
        date: this.tile.date,
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(GoalAddPopupComponent, options)
      .then((dialogResult: boolean) => {
        if (dialogResult) {
          this._getGoals();
        }
      });
  }
}
