import { Injectable } from '@angular/core';
import { analytics, auth } from 'firebase';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  platform: string;
  userAgent: string;

  constructor() { 
    if (window.navigator) {
      this.platform = window.navigator.platform
      this.userAgent = window.navigator.userAgent
    } 
  }

  event_ad_displayed(params: any) {
    environment.production ? analytics().logEvent("ad_displayed", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_ad_clicked(params: any) {
    environment.production ? analytics().logEvent("ad_clicked", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_spend_virtual_currency(params: any) {
    environment.production ? analytics().logEvent("spend_virtual_currency", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_ad_created(params: any) {
    environment.production ? analytics().logEvent("ad_created", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_promo_applied(params: any) {
    environment.production ? analytics().logEvent("promo_applied", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_begin_checkout(params: any) {
    environment.production ? analytics().logEvent("begin_checkout", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_purchase(params: any) {
    environment.production ? analytics().logEvent("purchase", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_account_removed(params: any) {
    environment.production ? analytics().logEvent("account_removed", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_blocked_user(params: any) {
    environment.production ? analytics().logEvent("blocked_user", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_download_app(params: any) {
    environment.production ? analytics().logEvent("download_app", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_update_prompt_submit(params: any) {
    environment.production ? analytics().logEvent("update_prompt_submit", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_app_load(params: any) {
    environment.production ? analytics().logEvent("app_load", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_page_view(params: {
    [key: string]: any;
    page_title?: string;
    page_location?: string;
    page_path?: string;
  }) {
    environment.production ? analytics().logEvent("page_view", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_sign_up(params: {
    [key: string]: any;
    method?: string;
  }) {
    environment.production ? analytics().logEvent("sign_up", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }

  event_login(params: {
    [key: string]: any;
    method?: string;
  }) {
    if (environment.production) {
      analytics().logEvent("login", {...params, platform: this.platform, userAgent: this.userAgent})
      if (auth().currentUser) {
        analytics().setUserId(auth().currentUser.uid)
      }
    }

  }

  event_logout(params) {
    environment.production ? analytics().logEvent("logout", {...params, platform: this.platform, userAgent: this.userAgent}) : null
  }
}
