import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs/internal/Subscription';
import { Ad, Company } from 'src/app/company/company.page';
import { AdService } from 'src/app/_services/ad.service';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { ApiService } from 'src/app/_services/api.service';
import { DataService } from 'src/app/_services/data.service';
import { PushService } from 'src/app/_services/push.service';
import { SearchComponent } from './search/search.component';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  fsegment = 'all';

  users: any[] = [];
  populars: any[] = [];
  requests: any[] = [];
  // visits: any[] = [];
  friends: any[] = [];
  pendings: any[] = [];
  // blocks: any[] = [];

  load: {
    users?: number;
    populars?: number;
    requests?: number;
    // visits?: number;
    friends?: number;
    pendings?: number;
  } = {};

  filters;

  user: any;

  subscriptions: Subscription[] = [];

  ad: Ad;
  sponsor: Company;

  constructor(
    private navCtrl: NavController,
    private api: ApiService,
    private route: ActivatedRoute,
    private push: PushService,
    private dataSv: DataService,
    private adServ: AdService,
    private analytics: AnalyticsService,
    private modalCtrl: ModalController
  ) {
    console.log(location.href);
    const segment = this.route.snapshot.paramMap.get('segment');
    console.log('this.fsegment', segment);
    if (segment) {
      this.fsegment = segment;
    } else {
      this.fsegment = 'all';
    }
  }

  ngOnInit() {
    this.users = [];
    this.subscriptions.push(
      this.dataSv.userStatusObs.subscribe((res) => {
        if (res) {
          res.user.college = JSON.parse(localStorage.college);
          this.user = res.user;
        }
      })
    );

    this.initLoadData(this.fsegment);
    this.subscriptions.push(
      this.push.freqAccepted.subscribe((res) => {
        const freqIndex = this.requests.map((x) => x.id).indexOf(res.id);
        if (freqIndex > -1) {
          this.requests.splice(freqIndex, 1);
        }
        this.friends = [...this.friends, res];
      })
    );
    this.subscriptions.push(
      this.push.freqReceived.subscribe((res) => {
        this.requests = [...this.requests, res];
      })
    );

    this.analytics.event_page_view({ page_title: 'Friends' });
  }

  ionViewWillEnter() {
    this.adServ.getRandomAd().then(
      (res: any) => {
        console.log('Random ad', res);
        if (res && res.ad && res.sponsor) {
          this.ad = res.ad;
          this.sponsor = res.sponsor;
        }
      },
      (err) => {
        console.log('Get Ad error: ', err);
      }
    );
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  segmentChanged($event) {
    this.initLoadData($event.target.value);
  }

  initLoadData(seg) {
    switch (seg) {
      case 'all':
        if (!this.users.length) {
          this.getSearchResult();
        }
        break;
      case 'requests':
        if (!this.requests.length) {
          this.getFriendRequests();
        }
        break;
      case 'popular':
        if (!this.populars.length) {
          this.getPopular();
        }
        break;
      case 'friends':
        if (!this.friends.length) {
          this.getFriends();
        }
        break;
      case 'pendings':
        if (!this.pendings.length) {
          this.getPendings();
        }
        break;
    }
  }

  // getAllUsers() {
  //   this.load.users = 1;
  //   console.log(this.users.length);
  //   this.api.get(`alumni/users?count=${this.users.length}`).subscribe((res: any[]) => {
  //     // console.log('Res: ', res, 'Blocks: ', this.blocks);
  //     this.users = res;
  //     if (res.length < 20) {
  //       this.load.users = 2;
  //     } else {
  //       this.load.users = 0;
  //     }
  //   });
  // }

  getPopular() {
    this.load.populars = 1;
    this.api.get('alumni/leaderboard').subscribe(
      (res: any) => {
        res.users.sort((a, b) => {
          return a.rank - b.rank;
        });
        this.populars = res.users;
        this.load.populars = 2;
        this.user.rank = res.user.rank;
      },
      (err) => {
        console.error('Error grabbing most popular users', err);
        this.load.populars = 2;
      }
    );
  }

  getFriendRequests() {
    this.load.requests = 1;
    this.api.get(`alumni/requests?count=${this.requests.length}`).subscribe((res: any[]) => {
      this.requests = this.requests.concat(res);
      if (res.length < 20) {
        this.load.requests = 2;
      } else {
        this.load.requests = 0;
      }
      this.dataSv.updateFriendRequest(this.requests);
    });
  }

  // getSuggests() {
  //   this.load.suggests = 1;
  //   this.api.get(`alumni/suggests?count=${this.suggests.length}`).subscribe((res: any[]) => {
  //     this.suggests = this.suggests.concat(res).filter((user) => !this.blocks.find((block) => user.id === block.id));
  //     if (res.length < 20) {
  //       this.load.suggests = 2;
  //     } else {
  //       this.load.suggests = 0;
  //     }
  //   });
  // }

  // getVisits() {
  //   this.load.visits = 1;
  //   this.api.get(`alumni/visits?count=${this.visits.length}`).subscribe((res: any[]) => {
  //     this.visits = this.visits.concat(res);
  //     if (res.length < 20) {
  //       this.load.visits = 2;
  //     } else {
  //       this.load.visits = 0;
  //     }
  //   });
  // }

  getFriends() {
    this.load.friends = 1;
    this.api.get(`alumni/friends?count=${this.friends.length}`).subscribe((res: any[]) => {
      this.friends = res;
      if (res.length < 20) {
        this.load.friends = 2;
      } else {
        this.load.friends = 0;
      }
    });
  }

  getPendings() {
    this.load.pendings = 1;
    this.api.get(`alumni/pendings?count=${this.pendings.length}`).subscribe((res: any[]) => {
      this.pendings = this.pendings.concat(res);
      if (res.length < 20) {
        this.load.pendings = 2;
      } else {
        this.load.pendings = 0;
      }
    });
  }

  async openSearch() {
    const modal = await this.modalCtrl.create({
      component: SearchComponent,
      componentProps: this.filters
        ? {
            ...this.filters,
            degree: { id: this.filters.degree },
            industry: { id: this.filters.industry },
            org: { id: this.filters.org },
          }
        : {},
    });

    modal.onWillDismiss().then((res) => {
      if (res.data && res.data.body) {
        this.fsegment = 'all';
        this.filters = res.data.body;
        this.getSearchResult();
      }
    });
    await modal.present();
  }

  getSearchResult() {
    this.load.users = 1;
    this.api.post('alumni/search?count=' + this.users.length, this.filters).subscribe((res: any[]) => {
      this.users = this.users.concat(res);
      console.log(res)
      if (res.length < 20) {
        this.load.users = 2;
      } else {
        this.load.users = 0;
      }
    });
  }

  // getBlocks() {
  //   this.load.blocks = 1;
  //   this.api.get(`alumni/blocks?count=${this.blocks.length}`).subscribe((res: any[]) => {
  //     console.log("Res: ", res)
  //     this.blocks = this.blocks.concat(res)
  //     if (res.length < 20) {
  //       this.load.blocks = 2;
  //     } else {
  //       this.load.blocks = 0;
  //     }
  //   })
  // }

  approveFriendRequest(u) {
    this.api
      .post('friend/approve', {
        fid: u.id,
      })
      .subscribe(
        (res) => {
          console.log('Approve friend request res', res);
          const index = this.requests.findIndex((x) => x.id === u.id);
          this.requests.splice(index, 1);
          if (this.friends.length) {
            this.friends = [...this.friends, u];
          }
          this.dataSv.updateFreqCount(false);
          this.dataSv.updateFriendsCount(true);
          this.dataSv.updateFriendRequest(this.requests);
          alert('Successfully added your friend!');
        },
        (err) => {
          if (err.status >= 200 && err.status <= 299) {
            console.log('Approve friend request w/ error', err);
            const index = this.requests.findIndex((x) => x.id === u.id);
            this.requests.splice(index, 1);
            if (this.friends.length) {
              this.friends = [...this.friends, u];
            }
            this.dataSv.updateFreqCount(false);
            this.dataSv.updateFriendsCount(true);
            this.dataSv.updateFriendRequest(this.requests);
            alert('Successfully added your friend!');
          } else {
            alert('An error has occurred. Error: ' + JSON.stringify(err));
          }
        }
      );
  }

  ignoreFriendRequest(u) {
    this.api
      .post('friend/ignore', {
        fid: u.id,
      })
      .subscribe(
        (res) => {
          const index = this.requests.map((x) => x.id).indexOf(u.id);
          this.requests.splice(index, 1);
          this.dataSv.updateFreqCount(false);
          this.dataSv.updateFriendRequest(this.requests);
        },
        (err) => {
          if (err.status >= 200 && err.status <= 299) {
            const index = this.requests.map((x) => x.id).indexOf(u.id);
            this.requests.splice(index, 1);
            this.dataSv.updateFreqCount(false);
            this.dataSv.updateFriendRequest(this.requests);
          } else {
            alert('An error has occurred. Error: ' + JSON.stringify(err));
          }
        }
      );
  }

  // addAsFriend(u) {
  //   this.api.post('friend/invite', {
  //     fid: u.id
  //   }).subscribe((res) => {
  //     console.log("Res from add as friend", res)
  //     const index = this.suggests.map(x => x.id).indexOf(u.id);
  //     this.suggests.splice(index, 1);
  //     if (this.pendings.length) {
  //       this.pendings = [...this.pendings, u];
  //     }
  //     alert("Friend request sent!")
  //   }, err => {
  //     if (err.status >= 200 && err.status <= 299) {
  //       console.log("Res from add as friend", err)
  //       const index = this.suggests.map(x => x.id).indexOf(u.id);
  //       this.suggests.splice(index, 1);
  //       if (this.pendings.length) {
  //         this.pendings = [...this.pendings, u];
  //       }
  //       alert("Friend request sent!")
  //     } else {
  //       alert("An error has occurred. Error: " + JSON.stringify(err))
  //     }
  //   });
  // }

  viewProfile(user) {
    console.log('Friend: ', user);
    this.navCtrl.navigateForward('/home/user/' + user.id);
  }
}
