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
import { EventData, Switch, TimePicker } from "@nativescript/core";
import { DistanceData, DistanceDataEntry, Goal, GoalEntry } from "~/app/data/data.model";
import { DataService } from "~/app/data/data.service";
import { DatePickerPopupComponent } from "../../date-picker-popup/date-picker-popup.component";
import { ListPickerPopupComponent } from "../../list-picker-popup/list-picker-popup.component";

import { TimePickerPopupComponent } from "../../time-picker-popup/time-picker-popup.component";

@Component({
  selector: "Goal-Add-Popup",
  templateUrl: "./goal-add-popup.component.html",
})
export class GoalAddPopupComponent implements OnInit {
  private _date: Date;
  public dateString: string;
  public timeString: string;
  public startDate: Date;
  public startDateString: string;
  public activity: string = "Running";
  public distance: number;
  public unit: string = "miles";

  constructor(
    private _params: ModalDialogParams,
    private _datepipe: DatePipe,
    private _dataService: DataService,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef
  ) {
    this._date = _params.context.date;
  }

  ngOnInit(): void {
    this.dateString = this._datepipe.transform(this._date, "longDate");
    this.timeString = this._datepipe.transform(this._date, "shortTime");
    this.startDateString = this._datepipe.transform(this._date, "shortDate");
    this.startDate = new Date(this._date.getTime());
  }

  public close(addedEntry: boolean) {
    this._params.closeCallback(addedEntry);
  }

  selectTime() {
    let options: ModalDialogOptions = {
      context: {
        date: this._date,
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(TimePickerPopupComponent, options)
      .then((dialogResult: Date) => {
        console.log(dialogResult);
        if (dialogResult) {
          this._date.setHours(dialogResult.getHours());
          this._date.setMinutes(dialogResult.getMinutes());
          this.timeString = this._datepipe.transform(this._date, "shortTime");
        }
      });
  }

  selectStartDate() {
    let options: ModalDialogOptions = {
      context: { date: this._date},
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(DatePickerPopupComponent, options)
      .then((dialogResult: Date) => {
        this.startDate = dialogResult;
        this.startDateString = this._datepipe.transform(this.startDate, "shortDate");
        console.log(this.startDateString);
      });
  }

  selectActivity() {
    let options: ModalDialogOptions = {
      context: {
        list: ["Running", "Walking"],
        lastSelected: this.activity,
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(ListPickerPopupComponent, options)
      .then((dialogResult: string) => {
        this.activity = dialogResult;
      });
  }

  selectUnit() {
    let options: ModalDialogOptions = {
      context: {
        list: ["miles", "kilometers"],
        lastSelected: this.unit,
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(ListPickerPopupComponent, options)
      .then((dialogResult: string) => {
        this.unit = dialogResult;
      });
  }

  public submitGoal() {
    if (this.activity === "Running") {
      this.activity = "run";
    } else {
      this.activity = "walk";
    }

    let endOfDay = new Date(this._date.getTime());
    endOfDay.setDate(this._date.getDate()+1);
    endOfDay.setMilliseconds(this._date.getMilliseconds()-1);


    const goal: GoalEntry = {
      date: endOfDay,
      activity: this.activity,
      distance: +this.distance,
      unit: this.unit,
      startDate: this.startDate
    };

    let collision: number = this._dataService.goalDateCollision(goal);
    if (!collision){
  
      this._dataService.addGoal(goal);
      this._dataService.goalsUpdated = true;
    }
    else {
      let options = {
        message: `<div style="color:black">This goal overlaps with another. Choose different goal dates.</div>`,
        okButtonText: "OK"
    };
    
      alert(options);
    }
    
    this._dataService.goalsUpdated = true;
    this.close(true);
  }
}
