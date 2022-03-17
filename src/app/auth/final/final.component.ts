import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-final',
  templateUrl: './final.component.html',
  styleUrls: ['./final.component.scss'],
})
export class FinalComponent implements OnInit {

  completed = 0;
  constructor(
    private nav: NavController,
    private api: ApiService,
    private utilServ: UtilsService
  ) { }

  ngOnInit() {
  }

  goBack() {
    this.nav.navigateBack('/profile');
  }

  onSubmit() {
    localStorage.setItem('verified', JSON.stringify(new Date()));
    localStorage.setItem('activated', JSON.stringify(new Date()));
    this.nav.navigateRoot('/home', {state: {login: "1"}});
    this.api.get('user/activate').toPromise().then((res) => {
      console.log("Res from submit", res)
    }).catch((err) => {
      if (err.status >= 200 && err.status <= 299) {
        console.log('activated')
      } else {
        console.error('user/activate', err);
        this.utilServ.presentErrorAlert(`Error activating your account: ${JSON.stringify(err.error)}`)
      }
    });
  }
}
