import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../_services/auth.service';
import { DataService } from '../_services/data.service';
import { ApiService } from '../_services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, OnDestroy {

  subscriptions: Subscription[] = []

  constructor(
    private menuCtrl: MenuController, 
    private auth: AuthService,
    private dataServ: DataService,
    private api: ApiService,

  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe()
    })
  }

  canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      if (localStorage.token) {
        this.menuCtrl.enable(true);
        console.log("Local storage has token")
        const sub1 = this.api.get('user').subscribe((res: any) => {
          console.log('getUserData', res);
          if (res) {
            this.api.get('notifications').subscribe((response) => {
              console.log('res from get notifications', response);
              this.dataServ.initUserData({...res, notifications: response})
              resolve(true)

            }, err => {
              console.error('onesignal', err);
            });

          } else {
            reject(false)
            this.auth.signout();
          }
        }, (err) => {
          console.error('user', JSON.stringify(err));
          reject(false)
          this.auth.signout();
        })
        this.subscriptions.push(sub1)
      } else {
        this.auth.signout();
        reject(false);
      }
    });
  }
}
