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
import { DistanceData, DistanceDataEntry } from "~/app/data/data.model";
import { DataService } from "~/app/data/data.service";
import { ListPickerPopupComponent } from "../../list-picker-popup/list-picker-popup.component";

import { TimePickerPopupComponent } from "../../time-picker-popup/time-picker-popup.component";

@Component({
  selector: "Entry-Popup",
  templateUrl: "./entry-popup.component.html",
})
export class EntryPopupComponent implements OnInit {
  private _date: Date;
  public entry: DistanceData;
  public editMode: boolean = false;

  public title: string = "ADD ENTRY";
  public dateString: string;
  public timeString: string;
  public activity: string;
  public distance: number;
  public unit: string;


  constructor(
    private _params: ModalDialogParams,
    private _datepipe: DatePipe,
    private _dataService: DataService,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef
  ) {
    this._date = _params.context.date;
    if (_params.context.entry){
      this.entry = _params.context.entry;
      this.editMode = true;
    }
  }

  ngOnInit(): void {

    if (this.editMode){
      this.title = "EDIT ENTRY";
      this.dateString = this._datepipe.transform(this.entry.date, "longDate");
      this.timeString = this._datepipe.transform(this.entry.date, "shortTime");
      this.activity = this.entry.activity;
      this.distance = this.entry.originalEntry;
      this.unit = this.entry.originalUnit;
    }
    else {
      this.dateString = this._datepipe.transform(this._date, "longDate");
      this.timeString = this._datepipe.transform(this._date, "shortTime");
      this.activity = "Running";
      this.unit = "miles";
    }
  }

  // Returns array with ID and deleted status
  // ID 0 = no changes
  // ID 1 = added new entry
  // Entry ID = updated entry with this ID
  public close(entryChange: [number, boolean]) { 
    this._params.closeCallback(entryChange);

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

  public submitEntry() {
    if (this.activity === "Running") {
      this.activity = "run";
    } else {
      this.activity = "walk";
    }

    const entry: DistanceDataEntry = {
      date: new Date(this._date.getTime()),
      distance: +this.distance,
      activity: this.activity,
      unit: this.unit,
    };

    this._dataService.addEntry(entry);
    this._dataService.distancesUpdated = true;
    this.close([1, false]);
  }

  public updateEntry() {
    console.log("edit");
    if (this.activity === "Running" || "run") {
      this.activity = "run";
    } else {
      this.activity = "walk";
    }

    const updatedEntry: DistanceDataEntry = {
      date: new Date(this._date.getTime()),
      distance: +this.distance,
      activity: this.activity,
      unit: this.unit,
    };

    this._dataService.updateEntry(updatedEntry, this.entry.id);
    this._dataService.distancesUpdated = true;
    this.close([this.entry.id, false]);
  }

  public deleteEntry() {
    this._dataService.deleteEntry(this.entry);
    this._dataService.distancesUpdated = true;
    this.close([this.entry.id, true]);
  }


}
