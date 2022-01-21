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
  public date: Date;
  public today: Date = new Date();
  public minDate: Date;
  public maxDate: Date;

  constructor(private _params: ModalDialogParams, private _datepipe: DatePipe) {

    this.date = new Date(this._params.context.date);
    this.minDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    this.maxDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());

  }

  ngOnInit(): void {}

  public close() {
    this._params.closeCallback(this.date);
  }

  onDatePickerLoaded(args) {
    // const datePicker = args.object as DatePicker;
  }

  onDateChanged(args) {
    this.date = args.value;
    console.log("Date value: " + args.value);
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
