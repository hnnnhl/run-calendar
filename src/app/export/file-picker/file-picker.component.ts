import { Component, OnInit, ViewContainerRef } from '@angular/core'
import { ModalDialogParams } from '@nativescript/angular';
import { Page } from '@nativescript/core';
import { knownFolders } from '@nativescript/core/file-system';
import { Folder } from '@nativescript/core/file-system';
import { FileSystemEntity } from '@nativescript/core/file-system';


@Component({
  selector: 'File-Picker',
  templateUrl: './file-picker.component.html',
})
export class FilePickerComponent implements OnInit {

  documentsFolder: Folder = knownFolders.documents();
  currentFolder: Folder = new Folder();
  folderEntities: FileSystemEntity[] = [];
  storage = require("nativescript-android-fs");
  page: Page;
  
  public prompt: string;

  constructor(private params: ModalDialogParams) {
        this.prompt = params.context.promptMsg;
    }

  public close(result: string) {
    this.params.closeCallback(result);
  }

  ngOnInit(): void {
    this.currentFolder = this.documentsFolder;
  }


}
