import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core'
import { ModalDialogParams } from '@nativescript/angular';
import { EventData, ListPicker } from '@nativescript/core';


@Component({
  selector: 'List-Picker-Popup',
  templateUrl: './list-picker-popup.component.html',
})
export class ListPickerPopupComponent {
  public picker: ListPicker;
  public list: string[];
  public lastSelected: string;

  constructor(private params: ModalDialogParams) {
        this.list = params.context.list;
        this.lastSelected = params.context.lastSelected;
    }

  public close(result: string) {
    this.params.closeCallback(result);
  }
 
  public onSelectedIndexChanged(args: EventData) {
    this.picker = <ListPicker>args.object;
  }


}
