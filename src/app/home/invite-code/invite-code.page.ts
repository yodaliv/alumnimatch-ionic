import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { ApiService } from 'src/app/_services/api.service';
import { Ad, Company } from 'src/app/company/company.page';

@Component({
  selector: 'app-invite-code',
  templateUrl: './invite-code.page.html',
  styleUrls: ['./invite-code.page.scss'],
})
export class InviteCodePage implements OnInit {
  load: any = {};
  users: any[] = [];
  blocks: any[] = []
  code: any;
  expired: any;
  ad: Ad;
  sponsor: Company;
  totalCount: any;
  constructor(
    private navCtrl: NavController,
    private api: ApiService,
    private analytics: AnalyticsService

  ) { }

  ngOnInit() {
    this.getInviteCode();
    this.analytics.event_page_view({page_title: "Invite Code"})
    this.getAllUsers();
    this.getUsersCount();
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  getInviteCode() {
    this.api.get('user/invite-code').subscribe((res: any) => {
      console.log('getInviteCode', res);
      this.code = res.code;
      this.expired = res.expired;
    });
  }

  refreshCode() {
    this.api.get('user/generate-code').subscribe((res: any) => {
      console.log('generateInviteCode', res);
      this.code = res.code;
      this.expired = res.expired;
    });
  }

  getAllUsers() {
    this.load.users = 1;
    console.log(this.users.length);
    this.api.get(`user/invited-users-list?count=${this.users.length}`).subscribe((res: any) => {
      console.log("Res: ", res, "Blocks: ", this.blocks)
      this.users = this.users.concat(res.users).filter((user) => !this.blocks.find((block) => user.id === block.id));
      if (res.users.length < 20) {
        this.load.users = 2;
      } else {
        this.load.users = 0;
      }
    });
  }
  getUsersCount() {
    this.load.users = 1;
    console.log(this.users.length);
    this.api.get(`user/invited-users-count`).subscribe((res: any) => {
      this.totalCount= res.userCount;
    });
  }
  viewProfile(user) {
    console.log("Friend: ", user)
    this.navCtrl.navigateForward('/home/user/' + user.id);
  }
}
