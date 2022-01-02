import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  Application,
  EventData,
  fromObject,
  ListPicker,
  Page,
  ScrollEventData,
  ScrollView,
  Switch,
} from "@nativescript/core";
import { DataService } from "../data/data.service";
import { DistanceData, DistanceDataEntry } from "../data/data.model";
import { CalendarEntriesService } from "../calendar/calendar-entries.service";
import { CalendarComponent } from "../calendar/calendar.component";
import { ModalDialogOptions, ModalDialogService } from "@nativescript/angular";
import { FilePickerComponent } from "../export/file-picker/file-picker.component";
import { ListPickerPopupComponent } from "../shared/list-picker-popup/list-picker-popup.component";

@Component({
  selector: "Home",
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, AfterViewInit {
  //  @ViewChild('calendar') Calendar: CalendarComponent;
  @ViewChild("calendar", { read: ViewContainerRef })
  container: ViewContainerRef;
  Calendar: CalendarComponent;

  distanceInput: number;
  public unit: string = "miles";
  public activity: string = "run";
  public unitKm: boolean;

  public showCalendar: boolean = false;
  public calendarRow: number = 10;
  private _scrollInit: boolean = false;
  private _scrollView: ScrollView;
  public isBusy: boolean = false;
  public entrySubmitted: boolean = false;

  constructor(
    private dataService: DataService,
    private resolver: ComponentFactoryResolver,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef
  ) {
    // Use the component constructor to inject providers.
  }
  ngAfterViewInit(): void {
    this.loadCalendar();
  }

  ngOnInit(): void {
    this.unit = this.dataService.unit;
    this.unit === "kilometers" ? (this.unitKm = true) : (this.unitKm = false);

    //this.dataService.deleteAllData();
    /*     this.dataService.addEntry({
      date: new Date(2021, 8, 25),
      distance: 1,
      activity: "walk",
    });
    this.dataService.addEntry({
      date: new Date(2021, 8, 28),
      distance: 7,
      activity: "run",
    });
    this.dataService.addEntry({
      date: new Date(2021, 8, 28),
      distance: 3,
      activity: "walk",
    });
    this.dataService.addEntry({
      date: new Date(2021, 8, 24),
      distance: 7,
      activity: "walk",
    }); */
  }

  async loadCalendar() {
    const factory: ComponentFactory<CalendarComponent> =
      this.resolver.resolveComponentFactory(CalendarComponent);
    const calendar = this.container.createComponent(factory);
    this.Calendar = calendar.instance;
    this.Calendar.loading.subscribe((loading) => {
      this.isBusy = loading;
    });
  }

  calendar() {
    this.showCalendar = !this.showCalendar;
    console.log(this.showCalendar);

    this.showCalendar ? (this.calendarRow = 1) : (this.calendarRow = 10);
  }

  async submitEntry() {
    const entry: DistanceDataEntry = {
      date: new Date(),
      distance: +this.distanceInput,
      activity: this.activity,
    };

    this.dataService.addEntry(entry);

    this.distanceInput = null;
    this.resetCalendar();

    await this.sleep(10);
  }

  onScroll(args: ScrollEventData) {
    if (!this._scrollInit) {
      this._scrollView = args.object as ScrollView;
    }
    this._scrollInit = true;
  }

  async resetCalendar() {
    this.isBusy = true;
    await this.sleep(10).then(() => {
      this.Calendar.resetMonths();

      if (this.Calendar.scrollX > this.Calendar.defaultXCoord) {
        this.Calendar.scrollView.scrollToHorizontalOffset(
          this.Calendar.defaultXCoord + 50,
          true
        );
      } else {
        this.Calendar.scrollView.scrollToHorizontalOffset(
          this.Calendar.defaultXCoord - 50,
          true
        );
      }
    });

    this.Calendar.scrollView.scrollToHorizontalOffset(
      this.Calendar.defaultXCoord,
      true
    );
    //  await this.sleep(30);
    this.Calendar.rightMost = 2;
    this.isBusy = false;
  }

  public navRun() {
    this._scrollView.scrollToVerticalOffset(0, true);
  }

  public navCalendar() {
    this._scrollView.scrollToVerticalOffset(716, true);
  }

  public titleTap(type: string) {
    var pickerlist: string[];
    var selected: string;

    switch (type) {
      case "unit": {
        pickerlist = ["miles", "kilometers"];
        selected = this.unit;
        break;
      }
      case "activity": {
        pickerlist = ["run", "walk"];
        selected = this.activity;
        break;
      }
      default: {
        break;
      }
    }

    let options: ModalDialogOptions = {
      context: {
        list: pickerlist,
        lastSelected: selected,
      },
      viewContainerRef: this.viewContainerRef,
    };

    this.modalService
      .showModal(ListPickerPopupComponent, options)
      .then((dialogResult: string) => {
        console.log(dialogResult);

        switch (type) {
          case "unit": {
            this.updateUnit(dialogResult);
            break;
          }
          case "activity": {
            this.activity = dialogResult;
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  onSwitchUnitChange(args: EventData) {
    var unitSwitch = args.object as Switch;

    if (unitSwitch.checked) {
      this.updateUnit("kilometers");
    }
    if (!unitSwitch.checked) {
      this.updateUnit("miles");
    }
  }

  updateUnit(newUnit: string) {
    if (newUnit === "km" || newUnit === "kilometers") {
      this.unit = "kilometers";
      this.dataService.unit = "km";
      this.unitKm = true;
    } else {
      this.unit = "miles";
      this.dataService.unit = "mi";
      this.unitKm = false;
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
