import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule } from '@nativescript/angular'

import { CalendarRoutingModule } from './calendar-routing.module'
import { CalendarComponent } from './calendar.component'

@NgModule({
  imports: [NativeScriptCommonModule, CalendarRoutingModule],
  declarations: [CalendarComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CalendarModule {}
