import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { College } from 'src/app/profile/_components/ps-colleges/ps-colleges.component';
import { ApiService } from 'src/app/_services/api.service';
import { DataService, UserInfo } from 'src/app/_services/data.service';
import { AlumniModalComponent } from '../alumni-modal/alumni-modal.component';

@Component({
  selector: 'app-alumni-sm',
  templateUrl: './alumni-sm.component.html',
  styleUrls: ['./alumni-sm.component.scss'],
})
export class AlumniSmComponent implements OnInit, OnDestroy {

  @Input() user: any;
  @Input() type: 'default' | 'tag' = 'default'

  signedInUserCollege: College;
  loggedIn: boolean = false;

  subscriptions: Subscription[] = []

  constructor(
    private modalCtrl: ModalController,
    private dataServ: DataService,
    private api: ApiService
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe()
    })
  }

  ngOnInit() {
    this.loggedIn = localStorage.token ? true : false;
    if (localStorage.college) {
      this.signedInUserCollege = JSON.parse(localStorage.college);
    }

    if (this.user.college) {
      if (typeof this.user.college === "string") {
        this.user.college = JSON.parse(this.user.college)
      }
  
      if (typeof this.user.college === "number") {
        this.user.college = {primary: this.user.college, id: this.user.college}
      }
  
      if (this.user.college.primary && !this.user.college.color1) {
        this.api.get(`static/college/${this.user.college.primary}`).toPromise().then((res) => {
          console.log("get static college result: ", res)
          this.user.college = {...this.user.college, ...res}
        })
      } 
    } else {
      this.user.college = this.signedInUserCollege
    }
    
  }

  async viewProfile() {
    if (this.type !== 'tag') {
      const modal = await this.modalCtrl.create({
        component: AlumniModalComponent,
        componentProps: {user: this.user},
        cssClass: 'alumni-modal-css'
      });
      return await modal.present();
    }
  }

}
