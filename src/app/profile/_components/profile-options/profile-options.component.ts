import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { ApiService } from 'src/app/_services/api.service';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-profile-options',
  templateUrl: './profile-options.component.html',
  styleUrls: ['./profile-options.component.scss'],
})
export class ProfileOptionsComponent implements OnInit {
  constructor(private api: ApiService, private auth: AuthService, private analytics: AnalyticsService, private popoverCtrl: PopoverController) {}

  ngOnInit() {}

  removeAccount() {
    if (confirm('Are you sure you want to remove your account? This will remove all your messages and posts as well. \nThis cannot be undone.')) {
      this.api.delete('user/delete', true).subscribe(
        (resp) => {
          console.log(resp);
          if (resp) {
            alert('Your account has been successfully removed.');
            this.analytics.event_account_removed({ user_id: JSON.parse(localStorage.getItem('user')).id });
            this.auth.signout();
            this.popoverCtrl.dismiss();
          } else {
            alert('Error deleting your account. Please try again.');
          }
        },
        (err) => {
          console.error(err);
          alert('Error deleting your account. Error: ' + JSON.stringify(err));
        }
      );
    }
  }

  blocks() {
    this.popoverCtrl.dismiss({ option: 'blocks' });
  }
}
