import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { CalendarComponent } from "./calendar.component";
import { AveragesComponent } from "./averages/averages.component";
import { MonthComponent } from "./month/month.component";
import { MonthTileComponent } from "./month/month-tile/month-tile.component";
import { DayPopupComponent } from "./day-popup/day-popup.component";
import { GoalBarComponent } from "./month/goal-bar/goal-bar.component";
import { GoalBarControllerComponent } from "./month/goal-bar/goal-bar-controller.component";
import { DatePipe } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";

@NgModule({
  imports: [NativeScriptCommonModule, 
   // SharedModule, 
    NativeScriptUIListViewModule],
  exports: [CalendarComponent],
  declarations: [
    CalendarComponent,
    AveragesComponent,
    MonthComponent,
    MonthTileComponent,
    DayPopupComponent,
    GoalBarComponent,
    GoalBarControllerComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [DatePipe],
})
export class CalendarModule {}
