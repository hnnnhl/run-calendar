import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule, NativeScriptFormsModule } from '@nativescript/angular'
import { ExportComponent } from './export.component'
import { FilePickerComponent } from './file-picker/file-picker.component'

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule ],
  declarations: [
    ExportComponent,
    FilePickerComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ExportModule {}
