import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  @Input() users: any[] = [];
  @Input() type: 'blocks';

  load: number;

  constructor(private api: ApiService, private router: Router, private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.type == 'blocks' && this.users.length == 0) {
      this.getBlocks();
    }
  }

  getBlocks() {
    this.load = 1;
    this.api
      .get(`alumni/blocks?count=${this.users.length}`)
      .toPromise()
      .then((res: any[]) => {
        console.log('Res: ', res);
        this.users = this.users.concat(res);
        if (res.length < 20) {
          this.load = 2;
        } else {
          this.load = 0;
        }
      });
  }

  unblock(user) {
    if (confirm('Are you sure you want to unblock this user?')) {
      this.api.post(`alumni/block/${user.id}`, { block: false }).subscribe(
        async (res) => {
          if (res) {
            alert("You've successfully unblocked this user.");
            this.users = this.users.filter((block) => block.id !== user.id);
            await this.dismiss();
            this.router.navigate(['/home/user/', user.id]);
          }
        },
        (err) => {
          console.error('Error: ', err);
          alert('We could not block this user, please try again.');
        }
      );
    }
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }
}
