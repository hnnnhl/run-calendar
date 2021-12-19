import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule } from '@nativescript/angular'

import { ExportRoutingModule } from './export-routing.module'
import { ExportComponent } from './export.component'

@NgModule({
  imports: [NativeScriptCommonModule, ExportRoutingModule],
  declarations: [ExportComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ExportModule {}
