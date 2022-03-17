import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/_services/api.service';
import { DataService, UserInfo } from 'src/app/_services/data.service';
import { Notification, PushService } from 'src/app/_services/push.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  unreadCount: number = 0;
  notifications: Notification[] = []
  user: UserInfo;

  subscriptions: Subscription[] = []
  constructor( 
    private modalCtrl: ModalController,
    private dataServ: DataService,
    private api: ApiService,
    private pushServ: PushService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.dataServ.userStatusObs.subscribe((userData) => {
        if (userData.notifications && !this.arraysEqual(userData.notifications, this.notifications)) {
          this.user = userData
          this.notifications = userData.notifications.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
          this.unreadCount = userData.notifications.filter((notif) => notif.viewed === 0).length
          /* this.notifications.forEach(async (notif) => {  TODO: Still needs set up to only grab new users (grab users that have already been grabbed, too many duplicate calls)
            notif.sender = await this.getUserForNotification(notif)
          }) */
        }
      })
    )
  }

  async getUserForNotification(notification: Notification) {
    return await new Promise((resolve, reject) => {
      const userIndex = this.notifications.findIndex((notification) => {
        return notification.sender && notification.sender.alumni.id === notification.sid
      })
      console.log("User found? ", userIndex)
      if (userIndex !== -1) {
        resolve(this.notifications[userIndex].sender)
      } else {
        this.api.get(`alumni/detail/${notification.sid}`).subscribe((res: any) => {
          console.log('getUserProfile', res);
          resolve(res.alumni)
        }, (err) => {
            console.error("Getting user error: ", err)
            reject(err)
        });
      }
      
    })
    
  }

  async viewNotification(notification: Notification) {
    const link = new URL(notification.link)
    this.navCtrl.navigateForward(link.hash.substring(1, link.hash.length))
    this.dismiss()
  }

  async clearOneNotification(notification: Notification){
    console.log("clear one notification", notification);
    return await new Promise((resolve, reject) => {
      this.api.delete(`notifications/${notification.id}`).subscribe((res: any) => {
        resolve(res)
        this.notifications.splice(this.notifications.findIndex((e) =>
        e === notification),1);
      }, (err) => {
          console.error("sending view error: ", err)
          reject(err)
      });
    })
  }

  async clearAllNotifications(){
    console.log("clear all notifications");
    if (confirm("Are you sure you want to clear all your notifications?")) {
      return await new Promise((resolve, reject) => {
        this.api.delete(`notifications/delete/allnotifs`).subscribe((res: any) => {
          resolve(res)
          this.notifications = [];
          this.unreadCount = 0;
        }, (err) => {
            console.error("sending view error: ", err)
            reject(err)
        });
      })
    }
    
  }
  
  dismiss() {
    this.modalCtrl.dismiss();
  }

  arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
