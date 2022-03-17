import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Ad, Company } from 'src/app/company/company.page';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { CompanyService } from 'src/app/_services/company.service';
import { AlumniModalComponent } from '../alumni-modal/alumni-modal.component';

@Component({
  selector: 'app-ad-sm',
  templateUrl: './ad-sm.component.html',
  styleUrls: ['./ad-sm.component.scss'],
})
export class AdSmComponent implements OnInit {

  @Input() ad: Ad;
  @Input() sponsorAds: boolean = true;
  @Input() company: Company;

  constructor(
    private navCtrl: NavController,
    private companyServ: CompanyService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit() {
    
  }

  async adClicked() {
    if (this.sponsorAds) {
      this.analytics.event_ad_clicked({ad_id: this.ad.id, user_id: JSON.parse(localStorage.getItem('user')).id})
      await this.viewAd()
    } else {
      await this.editAd()
    }
  }

  async viewAd() {
    this.navCtrl.navigateForward(`/ad/${this.ad.id}`, {state: {ad: this.ad}})
  }

  async editAd() {
    await this.navCtrl.navigateForward('/company/ad-edit', {state: {ad: this.ad, company: this.company}})
  }

}