import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from "@nativescript/angular";

import { ListPickerPopupComponent } from "./list-picker-popup/list-picker-popup.component";
import { TimePickerPopupComponent } from "./time-picker-popup/time-picker-popup.component";
import { DatePickerPopupComponent } from "./date-picker-popup/date-picker-popup.component";
import { EntryEditPopupComponent } from "./entries/entry-edit-popup/entry-edit-popup.component";
import { GoalAddPopupComponent } from "./entries/goal-add-popup/goal-add-popup.component";
import { EntryPopupComponent } from "./entries/entry-popup/entry-popup.component";

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptFormsModule],
  declarations: [
    ListPickerPopupComponent,
    EntryPopupComponent,
    TimePickerPopupComponent,
    DatePickerPopupComponent,
    EntryEditPopupComponent,
    GoalAddPopupComponent
  ],
  exports: [
    ListPickerPopupComponent,
    EntryPopupComponent,
    TimePickerPopupComponent,
    DatePickerPopupComponent,
    EntryEditPopupComponent,
    GoalAddPopupComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SharedModule {}
