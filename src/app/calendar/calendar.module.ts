import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule } from '@nativescript/angular'
import { CalendarComponent } from './calendar.component'
import { AveragesComponent } from './averages/averages.component'
import { MonthComponent } from './month/month.component'
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";


@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptUIListViewModule],
  exports: [
    CalendarComponent
  ],
  declarations: [
    CalendarComponent,
    AveragesComponent,
    MonthComponent,],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [],
})
export class CalendarModule {}
