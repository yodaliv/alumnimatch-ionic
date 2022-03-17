import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from 'src/app/_services/api.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
import { SelectModalComponent } from 'src/app/_shared/select-modal/select-modal.component';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilsService } from 'src/app/_services/utils.service';
import { PickLocationModalComponent } from 'src/app/_shared/pick-location-modal/pick-location-modal.component';
import { NamesComponent } from '../_components/names/names.component';
import { Router } from '@angular/router';
import { MoreInfoComponent } from 'src/app/_shared/more-info/more-info.component';
import { AnalyticsService } from 'src/app/_services/analytics.service';

@Component({
  selector: 'app-choose-college',
  templateUrl: './choose-college.component.html',
  styleUrls: ['./choose-college.component.scss'],
})
export class ChooseCollegeComponent implements OnInit {

  //questions: any[];
  countries: any[];
  states: any[];
  colleges: any[];
  highschools: any[];
  student = false;
  addCollege = false;
  addHighschool = false;
  schools: any[];
  hsIsSet = false;

  OKColleges: any[]; //hold on to OK colleges to avoid another api call.

  selectCountryOption: any = {
    header: 'Choose Country',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  selectStateOption: any = {
    header: 'Choose State',
    mode: 'md',
    cssClass: 'am-select-popup'
  };

  collegeForm: FormGroup;
  highschoolForm: FormGroup;

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private cdRef: ChangeDetectorRef,
    private nav: NavController,
    private auth: AuthService,
    private utils: UtilsService,
    private router: Router,
    private analytics: AnalyticsService
  ) {
    /* if (this.router.getCurrentNavigation().extras.state) {
      //this.questions = this.router.getCurrentNavigation().extras.state.questions;
    } */
   }

  ngOnInit() {
    this.initCollegeForm();
    this.getCountriesWithOUCollege();
    this.initHighschoolForm();
  }

  initCollegeForm() {
    this.collegeForm = this.formBuilder.group({
      country: new FormControl('1', [Validators.required]),
      state: new FormControl('36', [Validators.required]),
      college: new FormControl({id: 1489, name: 'University of Oklahoma'}, [Validators.required]),
    });
  }
  initHighschoolForm() {
    this.highschoolForm = this.formBuilder.group({
      country: new FormControl('1', [Validators.required]),
      state: new FormControl('36', [Validators.required]),
      college: new FormControl({id: 1489, name: 'University of Oklahoma'}, [Validators.required]),
    });
  }
  toggleStudent() {
    this.student = !this.student;
  }

  setFormListener() {
    this.collegeForm.get('country').valueChanges
      .subscribe(selectedCountry => {
        if (!selectedCountry) {
          this.collegeForm.controls.state.reset();
          this.collegeForm.controls.college.reset();
        } else {
          this.getStates(selectedCountry);
          this.collegeForm.controls.state.reset();
          this.collegeForm.controls.college.reset();
        }
        this.cdRef.detectChanges();
      });
    this.collegeForm.get('state').valueChanges
      .subscribe(selectedState => {
        console.log('selectedState', selectedState);
        if (!selectedState) {
          this.collegeForm.controls.college.reset();
        } else {
          this.getColleges(selectedState);
          this.collegeForm.controls.college.reset();
        }
        this.cdRef.detectChanges();
      });



    this.highschoolForm.get('country').valueChanges
    .subscribe(selectedCountry => {
      if (!selectedCountry) {
        this.highschoolForm.controls.state.reset();
        this.highschoolForm.controls.college.reset();
      } else {
        this.getStates(selectedCountry);
        this.highschoolForm.controls.state.reset();
        this.highschoolForm.controls.college.reset();
      }
      this.cdRef.detectChanges();
    });
  this.highschoolForm.get('state').valueChanges
    .subscribe(selectedState => {
      console.log('selectedState', selectedState);
      if (!selectedState) {
        this.highschoolForm.controls.college.reset();
      } else {
        this.getColleges(selectedState);
        this.highschoolForm.controls.college.reset();
      }
      this.cdRef.detectChanges();
    });
  }

  getCountriesWithOUCollege() {
    this.api.get('static/countries/ou', true).subscribe((res: any) => {
      this.schools = res.colleges;
      console.log('countries', res);
      this.countries = res.countries;
      this.states = res.states;
      this.colleges = this.schools.filter((school) => !school.highschool);
      this.highschools = this.schools.filter((school) => school.highschool);
      this.OKColleges = this.colleges;

      this.collegeForm.patchValue({
        country: 1,
        state: 36,
        college: {id: 1489, name: 'University of Oklahoma'}
      });
      this.highschoolForm.patchValue({
        country: 1,
        state: 36,
        college: null
      });
      this.setFormListener();
      this.cdRef.detectChanges();
    });
  }

  getColleges(sid) {
    const cid = this.collegeForm.value.country;
    this.api.get(`static/colleges/filter?country=${cid}&state=${sid}`, true).subscribe((res: any[]) => {
      console.log(res)
      this.schools = res;
      this.colleges = this.schools.filter((school) => !school.highschool);
      this.highschools = this.schools.filter((school) => school.highschool);
    });
  }

  getStates(cid) {
    this.api.get(`static/states/filter?country=${cid}`, true).subscribe((res: any[]) => {
      this.states = res;
      console.log('states', this.states);
    });
  }

  async chooseCollege() {
    if(this.highschoolForm.value.state !== 36 && this.collegeForm.value.state == 36){ // if HS was changed but colleges wasn't, populate with OK data
      this.colleges = this.OKColleges
    }
    console.log('choose college', this.colleges);
    const selectedItem = this.collegeForm.controls.college.value;
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.colleges,
        selectedItem: selectedItem ? selectedItem.id : null,
        multiple: false,
        title: 'Select College'
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false
    });
    modal.onDidDismiss().then((res) => {
      console.log('chooseCollege', res);
      if (res.data) {
        this.collegeForm.controls.college.setValue(res.data);
      }
    }).catch((err) => {
      console.error('chooseCollege', err);
    });
    return await modal.present();
  }

  async chooseHighschool() {
    console.log('choose hs', this.highschools);
    const selectedItem = this.highschoolForm.controls.college.value;
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.highschools,
        selectedItem: selectedItem ? selectedItem.id : null,
        multiple: false,
        title: 'Select Highschool'
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false
    });
    modal.onDidDismiss().then((res) => {
      console.log('choose hs', res);
      if (res.data) {
        this.hsIsSet = true;
        this.addHighschool = false;
        this.highschoolForm.controls.college.setValue(res.data);
      }
    }).catch((err) => {
      console.error('choose hs', err);
    });
    return await modal.present();
  }

  onSubmit() {
    console.log('this.collegeForm', this.collegeForm);
    if (this.collegeForm.valid) {
      this.buildUserData().then((data: any) => {
        console.log('buildUserData', JSON.stringify(data));
        this.getUserLocation().then((position: any) => {
          console.log('position: ', JSON.stringify(position));
          if (position) {
            data.lat = position.lat;
            data.lng = position.lng;
          }
          this.utils.showLoading();    
          this.auth.register(data).subscribe((res: any) => {
            this.analytics.event_sign_up({method: data.social})
            console.log('register', JSON.stringify(res));  
            console.log("Location to On by default");
            this.api.get(`user/location/show/1`).subscribe((res) => {
              console.log('changeLocationShow', res);
            }, (err) => {
              console.error('changeLocationShow Error', err);
            });
            this.utils.hideLoading();
            /* this.moreInfoPopup().then((data: {success: boolean}) => {
              if (data.success) { */
                this.nav.navigateRoot('/profile');
              /* } else {
                console.error("Error happened on info popover")
              }
            }).catch((err) => {
              console.error('data', JSON.stringify(err));
              this.utils.presentErrorAlert('An error occurred, please try again.');
            }); */
          }, (error) => {
            console.error('register', JSON.stringify(error));
            this.utils.hideLoading();
            this.utils.presentErrorAlert(error.error.message || 'Sorry. you failed to register.');
          });
        })
      });
    }
  }

  getUserLocation() {
    return new Promise((resolve, reject) => {
      this.utils.getCurrentPosition().then((res) => {
        resolve(res);
      }).catch(async () => {
        const modal = await this.modalCtrl.create({
          component: PickLocationModalComponent,
          backdropDismiss: false
        });
        modal.onDidDismiss().then((result) => {
          if (result && result.data) {
            console.log('result', result.data);
            resolve({
              lat: result.data.lat,
              lng: result.data.lng
            });
          } else {
            reject();
          }
        });
        modal.present();
      });
    });
  }

  resetHighschoolData() {
    this.hsIsSet = false
    this.addHighschool = true
    this.highschoolForm.patchValue({
      country: 1,
      state: 36,
      college: null
    });
  }

  /* async moreInfoPopup() {
    return await new Promise(async (resolve, reject) => {
      const modal = await this.modalCtrl.create({
        component: MoreInfoComponent,
        backdropDismiss: false
      })
      modal.onDidDismiss().then((res) => {
        if (res && res.data) {
          console.log('Res', res.data)
          resolve(res.data)
        } else {
          reject()
        }
      })
      modal.present();

    })
  } */

  buildUserData() {
    const user = JSON.parse(sessionStorage.user);
    let data: any;
    if(this.highschoolForm.controls.college.value.id){
      data = {
        social: user.type,
        sid: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        college: JSON.stringify({"primary":this.collegeForm.controls.college.value.id, "1":this.highschoolForm.controls.college.value.id}),
        inviterId: JSON.stringify({"inviter":user.inviterId.inviter}),
        email: user.email,
        student: this.student ? 1 : 0,
      };
    } else{
      data = {
        social: user.type,
        sid: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        college: JSON.stringify({"primary":this.collegeForm.controls.college.value.id}),
        inviterId: JSON.stringify({"inviter":user.inviterId.inviter}),
        email: user.email,
        student: this.student ? 1 : 0,
      };
    }
    return new Promise(async (resolve, reject) => {
      if (!data.first_name || !data.last_name || !data.email) {
        const modal = await this.modalCtrl.create({
          component: NamesComponent,
          componentProps: {user},
          cssClass: 'names-modal-css',
          backdropDismiss: false
        });
        modal.onDidDismiss().then((res) => {
          console.log(res)
          if (res.data) {
            data = {...data, ...res.data}
            resolve(data);
          } else {
            reject();
          }
        });
        return await modal.present();
      } else {
        resolve(data);
      }
    });
  }

  showNoCollegeAlert() {
    const message = `Please visit our contact us page and write us a note saying your school is not in the alumnimatch database.
                     We apologize! We will alert you when your school is added!`;
    this.utils.presentAlert('No College', message);
  }


}
