import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EMPLOYMENT_STATUSES, GENDERS, RELATIONSHIPS, RELIGIONS } from 'src/app/_config/current-life.constant';
import { DEGREES } from 'src/app/_config/degrees.constant';
import { INDUSTRIES } from 'src/app/_config/industries.constant';
import { ORGANIZATIONS } from 'src/app/_config/organizations.constant';
import { SelectModalComponent } from 'src/app/_shared/select-modal/select-modal.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  DEGREES = DEGREES;
  ORGANIZATIONS = ORGANIZATIONS;
  INDUSTRIES = INDUSTRIES;
  RELIGIONS = RELIGIONS;
  EMPLOYMENT_STATUSES = EMPLOYMENT_STATUSES;
  RELATIONSHIPS: string[] = RELATIONSHIPS;
  GENDERS = GENDERS;

  @Input() keyword: any;
  @Input() degree: any;
  @Input() industry: any;
  @Input() org: any;
  @Input() zip: any;
  @Input() religion: any;
  @Input() work_status: any;
  @Input() relationship: any;
  @Input() gender: any;

  selectReligionOption: any = {
    header: 'Select religion',
    mode: 'md',
    cssClass: 'am-select-popup',
  };
  selectEmploymentStatusOption: any = {
    header: 'Select work status',
    mode: 'md',
    cssClass: 'am-select-popup',
  };
  selectRelationshipOption: any = {
    header: 'Select relationship status',
    mode: 'md',
    cssClass: 'am-select-popup',
  };
  selectGenderOption: any = {
    header: 'Select gender',
    mode: 'md',
    cssClass: 'am-select-popup',
  };

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    console.log(this.degree, this.industry);
    if (this.degree.id >= 0) {
      this.degree = DEGREES[DEGREES.findIndex((ele) => ele.id == this.degree.id)];
    }
    if (this.industry.id >= 0) {
      this.industry = INDUSTRIES[INDUSTRIES.findIndex((ele) => ele.id == this.degree.id)];
    }
    if (this.industry.id >= 0) {
      this.org = ORGANIZATIONS[ORGANIZATIONS.findIndex((ele) => ele.id == this.degree.id)];
    }
  }

  async selectDegree() {
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.DEGREES,
        selectedItem: this.degree ? this.degree.id : null,
        multiple: false,
        title: 'Select degree',
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false,
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.degree = res.data;
      }
    });
    return await modal.present();
  }

  async selectIndustry() {
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.INDUSTRIES,
        selectedItem: this.industry ? this.industry.id : null,
        multiple: false,
        title: 'Select industry',
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false,
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.industry = res.data;
      }
    });
    return await modal.present();
  }

  async selectOrg() {
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.ORGANIZATIONS,
        selectedItem: this.org ? this.org.id : null,
        multiple: false,
        title: 'Select organization',
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false,
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.org = res.data;
      }
    });
    return await modal.present();
  }

  clearFilters() {
    this.keyword = null;
    this.degree = null;
    this.industry = null;
    this.org = null;
    this.zip = null;
    this.religion = null;
    this.work_status = null;
    this.relationship = null;
    this.gender = null;
  }

  onSubmit() {
    const body: any = {};
    if (this.keyword) {
      body.keyword = this.keyword;
    }
    if (this.degree) {
      body.degree = this.degree.id;
    }
    if (this.industry) {
      body.industry = this.industry.id;
    }
    if (this.org) {
      body.org = this.org.id;
    }
    if (this.zip) {
      body.zip = this.zip;
    }
    if (this.religion !== undefined && this.religion !== null) {
      body.religion = this.religion;
    }
    if (this.work_status !== undefined && this.work_status !== null) {
      body.work_status = this.work_status;
    }
    if (this.relationship !== undefined && this.relationship !== null) {
      body.relationship = this.relationship;
    }
    if (this.gender !== undefined && this.gender !== null) {
      body.gender = this.gender;
    }
    console.log('onSubmit', body);
    this.close(body);
  }

  close(data?: any) {
    this.modalCtrl.dismiss({ body: data });
  }
}
