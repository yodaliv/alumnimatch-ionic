import { Component, Input, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { ApiService } from 'src/app/_services/api.service';

@Component({
  selector: 'app-user-options',
  templateUrl: './user-options.component.html',
  styleUrls: ['./user-options.component.scss'],
})
export class UserOptionsComponent implements OnInit {

  @Input() user: any;

  constructor(
    private api: ApiService,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private analytics: AnalyticsService
  ) { }

  ngOnInit() {}

  zoom() {
    this.popoverCtrl.dismiss({zoom: true})
  }

  block() {
    if (confirm("Are you sure you want to block this user?")) {
      this.api.post(`alumni/block/${this.user.id}`, {block: true}).subscribe((res) => {
        if (res) {
          this.analytics.event_blocked_user({blocked_user: this.user.id})
          alert("You've successfully blocked this user.")
          this.popoverCtrl.dismiss()
          this.navCtrl.back()
        }
      }, err => {
        console.error("Error: ", err)
        alert("We could not block this user, please try again. Error: " + JSON.stringify(err))
      })
    }
  }
}
