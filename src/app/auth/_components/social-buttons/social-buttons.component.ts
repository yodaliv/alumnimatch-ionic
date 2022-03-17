import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AppleSignInErrorResponse, AppleSignInResponse, ASAuthorizationAppleIDRequest, SignInWithApple } from '@ionic-native/sign-in-with-apple/ngx';
import { TwitterConnect } from '@ionic-native/twitter-connect/ngx';
import { Platform } from '@ionic/angular';
import { auth } from 'firebase/app';
import { SOCIALS } from 'src/app/_config/devdata';
import { UtilsService } from 'src/app/_services/utils.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss'],
})
export class SocialButtonsComponent implements OnInit {
  @Input() acceptedTC: boolean = true;
  @Input() type: 'login' | 'join' = 'login'
  @Output() scClick: EventEmitter<any> = new EventEmitter();

  isIosMobile = false;
  socials: any = SOCIALS;
  constructor(
    public platform: Platform,
    private utils: UtilsService,
    private twitter: TwitterConnect,
    private facebook: Facebook,
    private google: GooglePlus,
    private signInWithApple: SignInWithApple,
    public afAuth: AngularFireAuth
  ) { }

  async ngOnInit() {
    if (this.platform.is('cordova') && this.platform.is('ios')) {
      this.isIosMobile = true;
    }
    await this.afAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL)
  }

  clickSc(type) {
    if (!this.acceptedTC) {
      this.utils.presentErrorAlert("Please accept our Terms & Conditions before joining AlumniMatch")
      return;
    }
    console.log("Logging in: ", type)
    if (!environment.production && 0) {
      console.log("Not production")
      const sc = this.socials[type];
      sc.type = type;
      this.scClick.emit(sc);
    } else {
      switch (type) {
        case 'facebook':
          this.facebookAuth().then((social) => {
            this.scClick.emit(social);
          }).catch((err) => {
            if (err) {
              this.utils.presentErrorAlert(err.error);
            }
          });
          break;
        case 'twitter':
          this.twitterAuth().then((social) => {
            this.scClick.emit(social);
          }).catch((err) => {
            if (err) {
              this.utils.presentErrorAlert(err.error);
            }
          });
          break;
        case 'google':
          this.googleAuth().then((social) => {
            this.scClick.emit(social);
          }).catch((err) => {
            if (err) {
              this.utils.presentErrorAlert(err.error);
            }
          });
          break;
        case 'apple':
          this.appleAuth().then((social) => {
            this.scClick.emit(social);
          }).catch((err) => {
            if (err) {
              this.utils.presentErrorAlert(err.error);
            }
          });
          break;
        default:
          break;
      }
    }
  }

  facebookAuth() {
    const promise = new Promise((resolve, reject) => {
      if (this.platform.is('cordova')) {
        this.facebook.login(['email', 'public_profile']).then((response: FacebookLoginResponse) => {
          console.log('facebook login:', response.authResponse);
          this.facebook.api('me?fields=id,name,link,first_name,last_name,picture,email', []).then(profile => {
            console.log('facebook profile', profile);
            const data: any = {
              first_name: profile.first_name,
              last_name: profile.last_name,
              username: profile.name,
              id: response.authResponse.userID,
              type: 'facebook',
              email: profile.email
            };
            if (profile.picture) {
              data.avatar = 'https://graph.facebook.com/' + data.id + '/picture?type=large';
            } else {
              data.avatar = 'assets/imgs/user.png';
            }
            resolve(data);
          }).catch((err) => {
            console.error('facebook profile', err);
            reject(this.handleError(err, 'Facebook'))
          });
        }).catch((err) => {
          console.error('facebook login', err);
          reject(this.handleError(err, 'Facebook'))
        });
      } else {
        this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider())
        .then((res: any) => {
          res = res.additionalUserInfo.profile;
          console.log('REs from Facebook: ', res)
          const data: any = {
            first_name: res.first_name,
            last_name: res.last_name,
            username: res.name,
            id: res.id,
            type: 'facebook',
            email: res.email
          };
          if (res.picture && res.picture.data && res.picture.data.url) {
            data.avatar = res.picture.data.url;
          } else {
            data.avatar = 'assets/imgs/user.png';
          }
          resolve(data);
        }).catch((err) => {
          console.error("Error: ", err)
          reject(this.handleError(err, 'Facebook'))
        })
      }
    });
    return promise;
  }

  twitterAuth() {
    const promise = new Promise((resolve, reject) => {
      if (this.platform.is('cordova')) {
        this.twitter.login().then((res) => {
          console.log('twitter login : ', res);
          let data: any = {};
          this.twitter.showUser().then((user) => {
            console.log('Twitter show user', user);
            const name = user.name.split(' ');
            data = {first_name: name[0], last_name: name[1], username: res.userName, id: res.userId, type: 'twitter', email: user.email};

            if (user.profile_image_url_https) {
              data.avatar = user.profile_image_url_https;
            } else {
              data.avatar = 'assets/imgs/user.png';
            }
            console.log('twitter user:', data);
            resolve(data);
          }, (err) => {
            console.error('twitter:', err);
            reject(this.handleError(err, 'Twitter'))
          });
        }).catch((err) => {
          console.error('twitter login:', err);
          reject(this.handleError(err, 'Twitter'))
        });
      } else {
        this.afAuth.auth.signInWithPopup(new auth.TwitterAuthProvider())
        .then((res: any) => {
          res = res.additionalUserInfo.profile;
          console.log("Res from twitter: ", res)
          const name = res.name.split(' ');
          const data: any = {
            first_name: name[0],
            last_name: name[1],
            username: res.screen_name,
            id: res.id,
            type: 'twitter',
            email: res.email
          };
          if (res.profile_image_url) {
            data.avatar = res.profile_image_url;
          } else {
            data.avatar = 'assets/imgs/user.png';
          }
          resolve(data);
        }).catch((err) => {
          console.error("Error: ", err)
          reject(this.handleError(err, 'Twitter'))
        })
      }
    });
    return promise;
  }

  googleAuth() {
    const promise = new Promise((resolve, reject) => {
      if (this.platform.is('cordova')) {
        this.google.login({})
          .then(res => {
            console.log('google login', res);
            const data: any = {
              first_name: res.givenName,
              last_name: res.familyName,
              username: res.displayName,
              id: res.userId,
              type: 'google',
              email: res.email
            };
            console.log('google  plus login:', data);
            if (res.imageUrl) {
              data.avatar = res.imageUrl;
            } else {
              data.avatar = 'assets/imgs/user.png';
            }
            resolve(data);
          })
          .catch(err => {
            console.error('google login', err);
            reject(this.handleError(err, 'Google+'))

          });
      } else {
        this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
        .then((res: any) => {
          res = res.additionalUserInfo.profile;
          console.log("Res from google login: ", res)
          const data: any = {
            first_name: res.given_name,
            last_name: res.family_name,
            username: res.name,
            id: res.id,
            type: 'google',
            email: res.email
          };
          if (res.picture) {
            data.avatar = res.picture;
          } else {
            data.avatar = 'assets/imgs/user.png';
          }
          resolve(data);
        }).catch((err) => {
          console.error("Google+ error: ", err)
          reject(this.handleError(err, 'Google+'))
        })
      }
    });
    return promise;
  }

  appleAuth() { 
    const promise = new Promise((resolve, reject) => {   
      this.signInWithApple.signin({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
        ]
      })
      .then((res: AppleSignInResponse) => {
        // https://developer.apple.com/documentation/signinwithapplerestapi/verifying_a_user
        console.log("apple login", JSON.stringify(res));
        const data: any = {
          first_name: res.fullName.givenName,
          last_name: res.fullName.familyName,
          username: res.fullName.givenName + ' ' + res.fullName.familyName,
          id: res.user,
          avatar: 'assets/imgs/user.png',
          type: 'apple',
          email: res.email
        };
        console.log('apple login:', JSON.stringify(data));
        resolve(data);
      })
      .catch((error: AppleSignInErrorResponse) => {
        console.error('apple login', error);
        reject({err: 'Apple+ login failed.' + error.code + ' ' + error.localizedDescription});
      });
    });
    return promise;
  }

  handleError(err: any, social: string) {
    if (err.code === 'auth/account-exists-with-different-credential') {
      this.afAuth.auth.fetchSignInMethodsForEmail(err.email).then((value) => {
        return {error: 'This email is already associated with ' + value + '. Please sign in there.'}
      })
    } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      return;
    } else {
      return {error: `${social} login failed.`}
    }
  }
}
