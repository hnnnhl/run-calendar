import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewContainerRef,
} from "@angular/core";
import { ModalDialogParams } from "@nativescript/angular";
import { DistanceData } from "~/app/data/data.model";
import { DataService } from "~/app/data/data.service";

@Component({
  selector: "Entry-Edit-Popup",
  templateUrl: "./entry-edit-popup.component.html",
})
export class EntryEditPopupComponent implements OnInit {
  public entry: DistanceData;

  constructor(
    private _params: ModalDialogParams,
    private _datepipe: DatePipe,
    private _dataService: DataService
  ) {
    this.entry = _params.context.entry;
  }

  ngOnInit(): void {}

  public close(result: number) {
    this._params.closeCallback(result);
  }

  public deleteEntry() {
    this._dataService.deleteEntry(this.entry);
    this._dataService.distancesUpdated = true;
    this.close(this.entry.id);
  }
}
