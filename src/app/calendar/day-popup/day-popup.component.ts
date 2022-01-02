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
import { DistanceData } from "~/app/data/data.model";
import { DataService } from "~/app/data/data.service";
import { EntryAddPopupComponent } from "~/app/shared/entry-add-popup/entry-add-popup.component";
import { ListPickerPopupComponent } from "~/app/shared/list-picker-popup/list-picker-popup.component";
import { MonthTileObject } from "../calendar-data.model";
import { CalendarEntriesService } from "../calendar-entries.service";
import { EntryEditPopupComponent } from "./entry-edit-popup/entry-edit-popup.component";

@Component({
  selector: "Day-Popup",
  templateUrl: "./day-popup.component.html",
})
export class DayPopupComponent implements OnInit {
  public tile: MonthTileObject;
  public entries: DistanceData[];
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

    if (this.tile.date > this._today) {
      this.future = true;
    }
  }

  private _getEntries() {
    this.entries = this._dataService
      .getAllData()
      .filter((data) =>
        this._entriesService.sameDay(data.date, this.tile.date)
      );
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

    console.log(this.entryStrings);
  }

  public generateEntryString(data: DistanceData) {
    let time = this._datepipe.transform(data.date, "shortTime");
    let activity: string = data.activity === "run" ? "Ran" : "Walked";

    let entry: string;
    let originalEntry = (entry =
      time +
      ": " +
      activity +
      " " +
      data.originalEntry +
      " " +
      data.originalUnit);
    let milesEntry =
      time +
      ": " +
      activity +
      " " +
      this._entriesService.polishDistance(
        this._dataService.convertToMi(data.distance)
      ) +
      " " +
      "MI";
    let kilometersEntry =
      time +
      ": " +
      activity +
      " " +
      this._entriesService.polishDistance(data.distance) +
      " " +
      "KM";

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

    return entry;
  }

  public updateEntry(data: DistanceData) {
    let options: ModalDialogOptions = {
      context: {
        entry: data,
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(EntryEditPopupComponent, options)
      .then((dialogResult: number) => {
        if (dialogResult) {
          console.log(dialogResult);
          let entryIndex: number = this.entries.findIndex(
            (x) => x.id === dialogResult
          );
          this.entries.splice(entryIndex, 1);
          this.refresh = true;
        }
      });
  }

  public addEntry() {
    let options: ModalDialogOptions = {
      context: {
        date: this.tile.date,
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(EntryAddPopupComponent, options)
      .then((dialogResult: boolean) => {
        if (dialogResult) {
          this._getEntries();
        }
      });
  }
}
