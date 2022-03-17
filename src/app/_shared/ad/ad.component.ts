import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { Ad, Company } from 'src/app/company/company.page';
import { AnalyticsService } from 'src/app/_services/analytics.service';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.scss'],
})
export class AdComponent implements OnInit, OnChanges {

  @Input() ad: Ad;
  @Input() sponsor: Company;
  @Input() preview: boolean = false;

  isLoading = false
  
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private analytics: AnalyticsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.preview) [
      this.analytics.event_ad_displayed({ad_id: this.ad.id})
    ]
  }

  ngOnInit() {
    console.log("Sponsor", this.sponsor)
  }

  learnMore() {
    if (!this.preview) {
      console.log(this.ad)
      this.analytics.event_ad_clicked({ad_id: this.ad.id, user_id: JSON.parse(localStorage.getItem('user')).id})
      this.navCtrl.navigateForward(`/ad/${this.ad.id}`, {state: {ad: this.ad}})
    }
    
  }

  close() {
    this.modalCtrl.dismiss()
  }

}
