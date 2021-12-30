import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule, NativeScriptFormsModule} from '@nativescript/angular'
import { CalendarModule } from '../calendar/calendar.module'
import { HomeRoutingModule } from './home-routing.module'
import { HomeComponent } from './home.component'
import { ListPickerPopupComponent } from './list-picker-popup/list-picker-popup.component'


@NgModule({
  imports: [
    HomeRoutingModule,
    NativeScriptCommonModule, 
    NativeScriptFormsModule,
    CalendarModule],
  declarations: [
    HomeComponent,
    ListPickerPopupComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class HomeModule {


}
