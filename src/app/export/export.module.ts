import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule } from '@nativescript/angular'

import { ExportRoutingModule } from './export-routing.module'
import { ExportComponent } from './export.component'
import { FilePickerComponent } from './file-picker/file-picker.component'

@NgModule({
  imports: [NativeScriptCommonModule, ExportRoutingModule],
  declarations: [
    ExportComponent,
    FilePickerComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ExportModule {}
