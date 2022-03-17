import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ATHLETE_POSITIONS } from 'src/app/_config/athletes.constant';
import * as ClConstants from 'src/app/_config/current-life.constant';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { ApiService } from 'src/app/_services/api.service';
import { AuthService } from 'src/app/_services/auth.service';
import { DataService } from 'src/app/_services/data.service';
import { UtilsService } from 'src/app/_services/utils.service';
import { UsersListComponent } from 'src/app/_shared/users-list/users-list.component';
import { ProfileOptionsComponent } from '../_components/profile-options/profile-options.component';
import { PsCollegesComponent } from '../_components/ps-colleges/ps-colleges.component';
import { SimilarUsersModalComponent } from '../_components/similar-users-modal/similar-users-modal.component';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss'],
})
export class ViewProfileComponent implements OnInit, OnDestroy {
  user: any;
  friends: any[];
  ps: any;
  cl: any;
  psegment = 'ps';
  colleges: any[] = [];

  subscriptions: Subscription[] = [];

  DEGREE_TYPES = ['Bachelors', 'Masters', 'Doctoral'];
  ATHLETE_POSITIONS = ATHLETE_POSITIONS;
  ATHLETE_MEMBERS = ['YES - Athlete', 'Yes - Staff', 'No - But big fan', "NO - Don't care"];

  WORK_FOR = ClConstants.WORK_FORS;
  BUYING_STUFFS = ClConstants.BUYING_STUFFS;
  CUSTOMERS = ClConstants.CUSTOMERS;
  EMPLOYMENT_STATUSES = ClConstants.EMPLOYMENT_STATUSES;
  HIRE_FULL_COUNT = ClConstants.HIRE_MONTHLY;
  HIRE_FULL_FOR = ClConstants.HIRE_FORS;
  GIG_PROJECTS = ClConstants.GIG_PROJECTS;
  HIRE_INTERN_COUNT = ClConstants.HIRE_MONTHLY;
  OWN_BUSINESS = ClConstants.OWN_BUSINESSES;
  REVIEW_PLANS = ClConstants.REVIEW_PLANS;
  WEALTHS = ClConstants.WEALTHS;
  WORK_TITLES = ClConstants.WORK_TITLES;

  GENDERS = ClConstants.GENDERS;
  AGEGROUPS = ClConstants.AGEGROUPS;
  ETHNICITIES = ClConstants.ETHNICITIES;
  LANGUAGES = ClConstants.LANGUAGES;
  RELIGIONS = ClConstants.RELIGIONS;
  RELATIONSHIPS = ClConstants.RELATIONSHIPS;
  MENTAL_EXERCISES = ClConstants.MENTAL_EXERCISES;
  PHYSICAL_EXERCISES = ClConstants.PHYSICAL_EXERCISES;
  CAUSES = ClConstants.CAUSES;
  SATIS_LEVELS = ClConstants.SATIS_LEVELS;

  constructor(
    private navCtrl: NavController,
    private api: ApiService,
    private modalCtrl: ModalController,
    private utils: UtilsService,
    private cdRef: ChangeDetectorRef,
    private dataSv: DataService,
    private auth: AuthService,
    private popoverCtrl: PopoverController,
    private analytics: AnalyticsService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnInit() {
    this.colleges[0] = JSON.parse(localStorage.getItem('college'));
    this.getUserData();
    this.analytics.event_page_view({ page_title: 'Current User Profile' });
  }

  takePhoto() {
    //New method
    this.utils
      .getPicture()
      .then((imageData) => {
        this.user.avatar = imageData.dataUrl;
        this.api
          .post(
            'user/avatar',
            {
              data: imageData.dataUrl.split(',')[1], //someone forgot that the backend ONLY takes base_64.
            },
            true
          )
          .subscribe(
            (res) => {
              console.log('uploadResult', res);
              this.user.avatar = res + '?' + new Date().getTime();
              this.dataSv.updateUserAvatar(this.user.avatar);
            },
            (error) => {
              console.error('uploadAvatarError', error);
            }
          );
      })
      .catch((err) => {
        console.error('err', err);
        this._takePhoto(); //backup plan
      });
  }

  _takePhoto() {
    //old method
    this.utils
      .takePhoto(true)
      .then((imageData) => {
        this.user.avatar = 'data:image/jpeg;base64,' + imageData;
        this.api
          .post(
            'user/avatar',
            {
              data: imageData,
            },
            true
          )
          .subscribe(
            (res) => {
              console.log('uploadResult for old method', res);
              this.user.avatar = res + '?' + new Date().getTime();
              this.dataSv.updateUserAvatar(this.user.avatar);
            },
            (error) => {
              console.error('uploadAvatarError', error);
            }
          );
      })
      .catch((err) => {
        console.error('err', err);
      });
  }

  editProfile() {
    this.navCtrl.navigateForward('/profile');
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  getUserData() {
    console.log(this.dataSv);
    const sub1 = this.dataSv.userStatusObs.subscribe(
      (res: any) => {
        console.log('getUserData', res);
        if (res) {
          this.user = res.user;
          this.friends = res.friends;
          this.ps = res.ps;
          this.cl = res.cl;
          this.cdRef.detectChanges();
        }
      },
      (err) => {
        console.error('user', err);
      }
    );

    this.subscriptions.push(sub1);
  }

  segmentChanged($event) {
    console.log('segmentChanged', $event.target.checked);
  }

  async findSimilarUsers(category, object) {
    console.log(category, object);

    const modal = await this.modalCtrl.create({
      component: SimilarUsersModalComponent,
      backdropDismiss: false,
      componentProps: { category, cid: object.id, cname: object.name },
    });
    return await modal.present();
  }

  viewProfile(user) {
    this.navCtrl.navigateForward('/home/user/' + user.id);
  }

  async presentOptionsPopover(event: Event) {
    const popover = await this.popoverCtrl.create({
      component: ProfileOptionsComponent,
      componentProps: {},
      event,
      translucent: true,
      backdropDismiss: true,
    });
    await popover.present();
    popover.onWillDismiss().then(async (res) => {
      if (res.data.option == 'blocks') {
        this.openBlocks();
      }
    });
  }

  async openBlocks() {
    const modal = await this.modalCtrl.create({
      component: UsersListComponent,
      componentProps: { type: 'blocks' },
    });

    await modal.present();
  }

  navigateTo(path: string) {
    this.navCtrl.navigateForward(path);
  }

  async changeNetworks() {
    const modal = await this.modalCtrl.create({
      component: PsCollegesComponent,
      componentProps: {},
      backdropDismiss: true,
    });
    await modal.present();
  }
}
