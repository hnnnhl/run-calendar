import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewContainerRef,
} from "@angular/core";
import { ModalDialogParams } from "@nativescript/angular";
import { TimePicker } from "@nativescript/core";

@Component({
  selector: "Time-Picker-Popup",
  templateUrl: "./time-picker-popup.component.html",
})
export class TimePickerPopupComponent implements OnInit {
  private _date: Date;
  public hour: number;
  public minute: number;

  time: Date = new Date();

  constructor(private _params: ModalDialogParams, private _datepipe: DatePipe) {
    this._date = new Date(this._params.context.date);
    this.hour = this._date.getHours();
    this.minute = this._date.getMinutes();
  }

  ngOnInit(): void {}

  public close(result: Date) {
    this._params.closeCallback(result);
  }

  onTimeChanged(args) {
    const tp = args.object as TimePicker;
    this.time = args.value;
  }
}
