import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewContainerRef,
} from "@angular/core";
import { ModalDialogParams } from "@nativescript/angular";
import { DatePicker } from "@nativescript/core";

@Component({
  selector: "Date-Picker-Popup",
  templateUrl: "./date-picker-popup.component.html",
})
export class DatePickerPopupComponent implements OnInit {
  //  private _date: Date;
  //  public hour: number;
  // public minute: number;

  time: Date = new Date();

  constructor(private _params: ModalDialogParams, private _datepipe: DatePipe) {
    //  this._date = new Date(this._params.context.date);
    // this.hour = this._date.getHours();
    // this.minute = this._date.getMinutes();
  }

  ngOnInit(): void {}

  public close(result: Date) {
    this._params.closeCallback(result);
  }

  minDate: Date = new Date(1975, 0, 29);
  maxDate: Date = new Date(2045, 4, 12);

  onDatePickerLoaded(args) {
    // const datePicker = args.object as DatePicker;
  }

  onDateChanged(args) {
    console.log("Date New value: " + args.value);
    console.log("Date value: " + args.oldValue);
  }

  onDayChanged(args) {
    console.log("Day New value: " + args.value);
    console.log("Day Old value: " + args.oldValue);
  }

  onMonthChanged(args) {
    console.log("Month New value: " + args.value);
    console.log("Month Old value: " + args.oldValue);
  }

  onYearChanged(args) {
    console.log("Year New value: " + args.value);
    console.log("Year Old value: " + args.oldValue);
  }
}
