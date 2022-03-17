import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-select-tag-user',
  templateUrl: './select-tag-user.component.html',
  styleUrls: ['./select-tag-user.component.scss'],
})
export class SelectTagUserComponent implements OnInit {

  @Input() usersProrate: any = []
  @Output() tag: EventEmitter<any> = new EventEmitter()
  
  constructor() { }

  ngOnInit() {}

  tagUser(user) {
    console.log("User: ", user)
    this.tag.emit(user)
  }
}
