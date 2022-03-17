import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/_services/analytics.service';

@Component({
  selector: 'app-auth-home',
  templateUrl: './auth-home.component.html',
  styleUrls: ['./auth-home.component.scss'],
})
export class AuthHomeComponent implements OnInit {

  constructor(
    private navCtrl: NavController,
    private analytics: AnalyticsService
  ) { }

  ngOnInit() {
    this.analytics.event_page_view({page_title: "Auth Home"})
  }

  next(point) {
    if (point === 0) {
      this.navCtrl.navigateForward('auth/login');
    } else {
      this.navCtrl.navigateForward('auth/join');
    }
  }

}
