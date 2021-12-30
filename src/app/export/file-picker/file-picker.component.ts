import { Component, OnInit, ViewContainerRef } from '@angular/core'
import { ModalDialogParams } from '@nativescript/angular';


@Component({
  selector: 'File-Picker',
  templateUrl: './file-picker.component.html',
})
export class FilePickerComponent implements OnInit {
  storage = require("nativescript-android-fs");
  pathInput: string = "";
  importSuccess: boolean = false;
  importFail: boolean = false;
  
  public prompt: string;


  constructor(private params: ModalDialogParams) {
        this.prompt = params.context.promptMsg;
    }

  public close(result: string) {
    this.params.closeCallback(result);
    this.importSuccess = false;
    this.importFail = false;
  }

  public importData(){

    var file;
    try{
      const fileName = (String(this.pathInput)).match('([^\/]+$)');
      const folderName = (String(this.pathInput)).match('^(.*[\\\/])');
  
      console.log('input: '+ this.pathInput);
      console.log('path: '+folderName[0]+fileName[0]);
  
   //   var file = this.storage.permission(folderName[0], fileName[0]);

      var readString = 'readstring';
      const dataFileContents = this.storage.read(folderName[0], fileName[0]);
      if(dataFileContents){
        readString = dataFileContents;
        this.importSuccess = true;
      } else {
        this.importSuccess = false;
      }

      console.log('contents of file: '+ readString);

    } catch (e) {
      this.importFail = true;
      console.log('catch: '+e);
    }

   /*  if (file) { 
      this.importSuccess = true;
      console.log('success import');
    } else {
      this.importFail = true;
    }

    console.log(file); */
  }

  ngOnInit(): void {
   
  }
 

}
