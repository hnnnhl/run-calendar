import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { CalendarComponent } from "./calendar.component";
import { AveragesComponent } from "./averages/averages.component";
import { MonthComponent } from "./month/month.component";
import { MonthTileComponent } from "./month/month-tile/month-tile.component";
import { DayPopupComponent } from "./day-popup/day-popup.component";
import { EntryEditPopupComponent } from "./day-popup/entry-edit-popup/entry-edit-popup.component";
import { DatePipe } from "@angular/common";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [NativeScriptCommonModule, SharedModule],
  exports: [CalendarComponent],
  declarations: [
    CalendarComponent,
    AveragesComponent,
    MonthComponent,
    MonthTileComponent,
    DayPopupComponent,
    EntryEditPopupComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [DatePipe],
})
export class CalendarModule {}
