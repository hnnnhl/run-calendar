import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule } from '@nativescript/angular'
import { CalendarComponent } from './calendar.component'
import { AveragesComponent } from './averages/averages.component'
import { MonthComponent } from './month/month.component'



@NgModule({
  imports: [
    NativeScriptCommonModule],
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
