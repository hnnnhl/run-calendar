import {
  Component,
  Input,
  OnInit,
} from "@angular/core";


@Component({
  selector: "Goal-Bar",
  templateUrl: "./goal-bar.component.html",
})
export class GoalBarComponent implements OnInit {
  @Input() row;
  @Input() column;
  @Input() colspan;
  @Input() text;
  @Input() horizontalAlignment;
  @Input() barClass;

  constructor(
  ) {}

  ngOnInit(): void { 
  }

}