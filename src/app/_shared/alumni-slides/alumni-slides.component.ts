import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alumni-slides',
  templateUrl: './alumni-slides.component.html',
  styleUrls: ['./alumni-slides.component.scss'],
})
export class AlumniSlidesComponent implements OnInit {

  @Input() users: any[];
  @Input() align: string = 'left';
  @Input() slidesPerView:  number = 5

  slideOpts;

  constructor() {}

  ngOnInit() {
    this.slideOpts = {
      slidesPerView: this.slidesPerView
    };
    console.log(this.users, this.align)
    // align items at the end (appending empty items)
    if (this.users && (this.users.length < this.slideOpts.slidesPerView) && this.align === 'right') {
      const usersToAdd = this.slidesPerView - this.users.length
      for (let index = 1; index <= usersToAdd; index++) {
        this.users.unshift({id: -1})
      }
      console.log(this.users)
    }
  }

}
