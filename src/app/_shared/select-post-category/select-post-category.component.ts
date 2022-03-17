import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-select-post-category',
  templateUrl: './select-post-category.component.html',
  styleUrls: ['./select-post-category.component.scss'],
})
export class SelectPostCategoryComponent implements OnInit {

  @Input() categoriesProrate: any = []
  @Output() tag: EventEmitter<any> = new EventEmitter()

  constructor() { }

  ngOnInit() {}

  tagCat(cat) {
    this.tag.emit(cat)
  }

}
