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
import { ListPickerPopupComponent } from "../list-picker-popup/list-picker-popup.component";
import { TimePickerPopupComponent } from "../time-picker-popup/time-picker-popup.component";

@Component({
  selector: "Entry-Add-Popup",
  templateUrl: "./entry-add-popup.component.html",
})
export class EntryAddPopupComponent implements OnInit {
  private _date: Date;
  public dateString: string;
  public timeString: string;
  public activity: string = "running";
  public distance: number;
  public unit: string = "mi";

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

  selectActivity() {
    let options: ModalDialogOptions = {
      context: {
        list: ["running", "walking"],
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
        list: ["mi", "km"],
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
    if (this.activity === "running") {
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
    this.close(true);
  }
}
