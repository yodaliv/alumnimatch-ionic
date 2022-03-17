import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { College } from 'src/app/profile/_components/ps-colleges/ps-colleges.component';
import { ApiService } from 'src/app/_services/api.service';

@Component({
  selector: 'app-alumni',
  templateUrl: './alumni.component.html',
  styleUrls: ['./alumni.component.scss'],
})
export class AlumniComponent implements OnInit {
  @Input() user: any;
  @Input() detailIcon = true;
  @Input() rank = false;
  // @Input() isInvite:boolean;
  @Output() profileClick: EventEmitter<any> = new EventEmitter();

  currentUserCollege: College;

  constructor(private api: ApiService) {
    this.currentUserCollege = JSON.parse(localStorage.college);
  }

  ngOnInit() {
    console.log('User', this.user);
    if (this.user.verified_at && typeof this.user.verified_at === 'string') {
      const newDate = new Date();
      const parsedDate = this.user.verified_at.split(' ')[0].split('-');
      newDate.setFullYear(Number(parsedDate[0]), Number(parsedDate[1]), Number(parsedDate[2]));

      console.log(newDate);
      this.user.verified_at = newDate;
    }

    if (typeof this.user.college === 'string') {
      this.user.college = JSON.parse(this.user.college);
    }

    if (this.user.college.primary && !this.user.college.color1) {
      this.api
        .get(`static/college/${this.user.college.primary}`)
        .toPromise()
        .then((res) => {
          console.log('get static college result: ', res);
          this.user.college = { ...this.user.college, ...res };
        });
    }
  }

  viewProfile() {
    this.profileClick.emit(this.user);
  }
}
