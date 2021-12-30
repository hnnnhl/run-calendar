import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptModule } from '@nativescript/angular'
import { AppComponent } from './app.component'
import { HomeModule } from './home/home.module'
import { ExportModule } from './export/export.module'
import { AppRoutingModule } from './app-routing.module'
import { CalendarModule } from './calendar/calendar.module'

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    NativeScriptModule,
    CalendarModule,
    ExportModule,
    HomeModule,],
  declarations: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
  providers: []
})
export class AppModule {}
