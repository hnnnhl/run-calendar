import {
    AfterViewInit,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    Input,
    OnInit,
    ViewChild,
    ViewContainerRef,
  } from "@angular/core";
  import { ModalDialogOptions, ModalDialogService } from "@nativescript/angular";
  import { Goal } from "~/app/data/data.model";
  import { DataService } from "~/app/data/data.service";
  import { MonthObject, MonthTileObject } from "../../calendar-data.model";
  import { CalendarEntriesService } from "../../calendar-entries.service";
import { GoalBarComponent } from "./goal-bar.component";
  
  
  @Component({
    selector: "Goal-Bar-Controller",
    templateUrl: "./goal-bar-controller.component.html",
  })
  export class GoalBarControllerComponent implements OnInit, AfterViewInit {
  
    @Input() monthObject: MonthObject;
    public today: Date;
  
    public monthGoals: Goal [] = []
    private _monthStart: Date;
    private _monthEnd: Date;

    @ViewChild("goals", { read: ViewContainerRef }) container: ViewContainerRef;
    private _factory: ComponentFactory<GoalBarComponent>;

    public row: number = 3;
    public column: number = 0;
    public colspan: number = 7;
    public text: string = " ";
    public horizontalAlignment: string = "center";
    public barClass: string  = "goal-bar middleDay";
  
    constructor(
      private _dataService: DataService,
      private _entriesService: CalendarEntriesService,
      private _resolver: ComponentFactoryResolver,
    ) {}
  
    ngOnInit(): void {
  
      this._monthStart = this.monthObject.tiles[0].date;
      this._monthEnd = this.monthObject.tiles[41].date; // All months have 42 days
  
      this._factory = this._resolver.resolveComponentFactory(GoalBarComponent);

      this.getMonthGoals();
      //this.monthGoals.forEach(x =>{console.log("monthgoals;;;;"+x.date+"//"+x.activity)});
    }

        
    ngAfterViewInit(): void {

      if (this.container){
        this.getGoalBarInstances();
        }
   
    }
  
    public getMonthGoals(){
      this._dataService.getAllGoals().forEach( g => {
        if (!g.startDate || g.startDate < new Date (1970, 0, 1)){ //If no startDate is given, the goal is for a single day. Check if this day is in range of the month.
          if (this._monthStart <= g.date && g.date <= this._monthEnd){
            this.monthGoals.push(g);
            console.log("single day pushed to month goal;;;;"+g.date+"//"+g.activity);
          }
        } 
        else { //If g.startDate exists, every day in the range of g.startDate to g.date is checked to see if it is in range of the month
          let goalStart = new Date (g.startDate.getTime());
          let end = new Date(g.date.getTime());
          end.setDate(end.getDate()+1);

          while (!(this._entriesService.sameDay(goalStart, end))){
            if (this._monthStart <= goalStart && goalStart <= this._monthEnd){ 
              this.monthGoals.push(g);
              console.log("date is in range and added to month goals;;;;"+g.date+"//"+g.startDate);
              break;
            }
            goalStart.setDate(goalStart.getDate()+1);
          }
        }
      }); 
    }

    getGoalBarInstances() {
    
     this.container.clear();
  
     if (this.monthGoals && this.monthGoals.length > 0){
      this.monthGoals.forEach((goal) => {

        let goalText = this._entriesService.polishDistance(goal.distanceRemaining)+"";

        console.log("goal start "+ goal.startDate);
        if (!goal.startDate || 
            goal.startDate < new Date(1970, 0, 1) || 
            this._entriesService.sameDay(goal.startDate, goal.date)){
          let tile: MonthTileObject = this.monthObject.tiles.find(tile => this._entriesService.sameDay(tile.date, goal.date));
          const goalBar = this.container.createComponent(this._factory);
      
          goalBar.instance.row = tile.row;
          goalBar.instance.column = tile.column;
          goalBar.instance.colspan = 1;
          goalBar.instance.text = goalText;
          goalBar.instance.horizontalAlignment = "center";
          goalBar.instance.barClass = "goal-bar singleDay";

          goalBar.changeDetectorRef.detectChanges();
        }
        else {

          let tile: MonthTileObject;
          let startedBefore: boolean = false; 
          let diff: number;

          if (goal.startDate < this._monthStart && !this._entriesService.sameDay(this._monthStart, goal.startDate)){ //If this goal started before this month
            tile = this.monthObject.tiles.find(tile => this._entriesService.sameDay(tile.date, this._monthStart));
            diff = Math.abs(this._monthStart.getTime() - goal.date.getTime());
            startedBefore = true;
          } 
          else{
            tile = this.monthObject.tiles.find(tile => this._entriesService.sameDay(tile.date, goal.startDate));
            diff = Math.abs(goal.startDate.getTime() - goal.date.getTime());
          }
          
          let diffDays = Math.ceil(diff / (1000 * 3600 * 24));//+1;
          let currentRow: number = tile.row;
          let dayOfWeek: number = tile.date.getDay();
          console.log("diff days "+diffDays +"GOAL: "+ goal.startDate +"//"+goal.date);

          if (!startedBefore){
            const firstDayBar = this.container.createComponent(this._factory);
        
            firstDayBar.instance.row = tile.row;
            firstDayBar.instance.column = tile.column;
            firstDayBar.instance.colspan = 1;
            firstDayBar.instance.text = goalText;
            firstDayBar.instance.horizontalAlignment = "right";
            firstDayBar.instance.barClass = "goal-bar firstDay";

            firstDayBar.changeDetectorRef.detectChanges();

            diffDays--; //Subtracting 1 for the day firstDayBar covers
         
          let newDayCalculation0: [number, number, boolean] = this._newDay(dayOfWeek, 1); //Adding 1 for the day firstDayBar covers
          dayOfWeek = newDayCalculation0[0];
          currentRow += this._rowUpdate(newDayCalculation0);
          console.log("currentrow line 149 "+currentRow);
        }
        
        console.log ("while (diffdays>0 --diffdays "+diffDays);
          while (diffDays > 0){
            let remainingDaysInWeek: number = 7-dayOfWeek;
            if (remainingDaysInWeek >= diffDays && diffDays != 1) {
              console.log("remainingDaysInWeek > diffDays//"+remainingDaysInWeek+"//"+diffDays);
              let colspan2 = diffDays-1; // -1 subtracting 1 to leave room for the final day

              if (currentRow <= 7) { // 7 is the last row in the calendar
                const midBar = this.container.createComponent(this._factory);
        
                midBar.instance.row = currentRow;
                midBar.instance.column = dayOfWeek;
                midBar.instance.colspan = colspan2; 
                midBar.instance.text = goalText;
                midBar.instance.horizontalAlignment = "center";
                midBar.instance.barClass = "goal-bar middleDay";

                midBar.changeDetectorRef.detectChanges();

                }
              else {
                break;
              }
               // diffDays=1; //Updating to 1 because we've already calculated that this will be the last day
              diffDays = diffDays-(colspan2);
              let newDayCalculation4: [number, number, boolean] = this._newDay(dayOfWeek, colspan2); 
              dayOfWeek = newDayCalculation4[0];
              
            }
            else if (diffDays > 1){ 
                let colspan0: number = remainingDaysInWeek;//diffDays-remainingDaysInWeek;
                console.log("diffdays does not equal 1")


                  if (currentRow <= 7) {
                    const midBar = this.container.createComponent(this._factory);
            
                    midBar.instance.row = currentRow;
                    midBar.instance.column = dayOfWeek;
                    midBar.instance.colspan = colspan0; 
                    midBar.instance.text = goalText;
                    midBar.instance.horizontalAlignment = "center";
                    midBar.instance.barClass = "goal-bar middleDay";

                    midBar.changeDetectorRef.detectChanges();
        
                    diffDays=diffDays-colspan0; 
                    let newDayCalculation1: [number, number, boolean] = this._newDay(dayOfWeek, colspan0); 
                    dayOfWeek = newDayCalculation1[0];
                    currentRow += this._rowUpdate(newDayCalculation1);
                  } 
                  else {
                    break;
                  }
            

                while ((diffDays/7) > 1){
                  console.log(this.monthObject.month+" current row, diffdays"+diffDays+"//"+currentRow);

                  if (currentRow <= 7){
                    const fullWeekBar = this.container.createComponent(this._factory);
          
                    fullWeekBar.instance.row = currentRow;
                    fullWeekBar.instance.column = dayOfWeek;
                    fullWeekBar.instance.colspan = 7; // subtracting 1 to leave room for the final day
                    fullWeekBar.instance.text = goalText;
                    fullWeekBar.instance.horizontalAlignment = "center";
                    fullWeekBar.instance.barClass = "goal-bar middleDay";
      
                    fullWeekBar.changeDetectorRef.detectChanges();
                  } 
                  else {
                    break;
                  }
                    diffDays = diffDays-7;
                    let newDayCalculation2: [number, number, boolean] = this._newDay(dayOfWeek, 7); 
                    dayOfWeek = newDayCalculation2[0];
                    currentRow += this._rowUpdate(newDayCalculation2);
            
                }

                let colspan1: number = diffDays//-remainingDaysInWeek;

                if (diffDays > 1){ // Skipping to lastDay bar if this is the last day
                  if (currentRow <= 7){
                    const lastMidBar = this.container.createComponent(this._factory);
            
                    lastMidBar.instance.row = currentRow;
                    lastMidBar.instance.column = dayOfWeek;
                    lastMidBar.instance.colspan = colspan1-1; // subtracting 1 to leave room for the final day
                    lastMidBar.instance.text = goalText;
                    lastMidBar.instance.horizontalAlignment = "center";
                    lastMidBar.instance.barClass = "goal-bar middleDay";
        
                    lastMidBar.changeDetectorRef.detectChanges();
                  }
                  else {
                    break;
                  }
              

                diffDays=diffDays-(colspan1);
                let newDayCalculation3: [number, number, boolean] = this._newDay(dayOfWeek, colspan1-1); 
                dayOfWeek = newDayCalculation3[0];
                }
            } 
            
            

            if (currentRow <= 7){ console.log("goalText=="+ goalText);
              const lastDayBar = this.container.createComponent(this._factory);
      
              lastDayBar.instance.row = currentRow;
              lastDayBar.instance.column = dayOfWeek;
              lastDayBar.instance.colspan = diffDays; 
              lastDayBar.instance.text = goalText;
              lastDayBar.instance.horizontalAlignment = "left";
              lastDayBar.instance.barClass = "goal-bar lastDay";

              lastDayBar.changeDetectorRef.detectChanges();
            }
            else {
              break;
            }

            diffDays=0;

          } 
        }
  

      });
    }
  }

  // Returns an array
  // index 0 contains the new day of the week 
  // index 1 contains how many full weeks were contained in daysAdded
  // index 2 contains a boolean indicating if the calendar row needs to be incremented
  private _newDay(currentDay: number, daysAdded: number): [number, number, boolean]{
    let newDay: number = currentDay+daysAdded;
    let addedFullWeeks: number = 0;
    if (newDay > 6){
      addedFullWeeks = Math.floor((currentDay+daysAdded)/7);
      let totalDaysInFullWeeks: number = addedFullWeeks*7;
      return [newDay - totalDaysInFullWeeks, addedFullWeeks, true];
    }
    else {
      return [newDay, addedFullWeeks, false];
    }
  }

  private _rowUpdate(newDayCalculation: [number, number, boolean]): number{
    if (newDayCalculation[2]){
      if (newDayCalculation[1] === 0){
        return 1;
      }
      else {
        return newDayCalculation[1];
      }
    }
  else {
    return 0;
  }
  }

}
  