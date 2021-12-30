import { Component, ViewContainerRef, OnInit } from '@angular/core'
import { ModalDialogOptions, ModalDialogService } from '@nativescript/angular';
import { FilePickerComponent } from './file-picker/file-picker.component';


@Component({
  selector: 'Export',
  templateUrl: './export.component.html',
})
export class ExportComponent implements OnInit {

  public result: string;

  constructor(
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef) {
    // Use the component constructor to inject providers.
  }

  public onImport() {
    let options: ModalDialogOptions = {
        viewContainerRef: this.viewContainerRef
    };

    this.modalService.showModal(FilePickerComponent, options);
  }


  ngOnInit(): void {
    // Init your component properties here.
  }

}
