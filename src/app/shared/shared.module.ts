import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from "@nativescript/angular";
import { EntryAddPopupComponent } from "./entry-add-popup/entry-add-popup.component";
import { ListPickerPopupComponent } from "./list-picker-popup/list-picker-popup.component";
import { TimePickerPopupComponent } from "./time-picker-popup/time-picker-popup.component";
import { DatePickerPopupComponent } from "./date-picker-popup/date-picker-popup.component";

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptFormsModule],
  declarations: [
    ListPickerPopupComponent,
    EntryAddPopupComponent,
    TimePickerPopupComponent,
    DatePickerPopupComponent,
  ],
  exports: [
    ListPickerPopupComponent,
    EntryAddPopupComponent,
    TimePickerPopupComponent,
    DatePickerPopupComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SharedModule {}
