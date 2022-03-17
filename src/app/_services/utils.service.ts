import { Injectable } from '@angular/core';
import {  } from '@ionic-native/camera/ngx';
import { ActionSheetController, LoadingController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ImagePicker ,ImagePickerOptions} from '@ionic-native/image-picker/ngx';
import { Camera as cam, CameraOptions as camops } from '@ionic-native/camera/ngx';
import { Camera, CameraOptions, CameraPhoto, CameraResultType, CameraSource } from '@capacitor/core' // DOCS: https://capacitorjs.com/docs/apis/camera

declare var google;

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private camera: cam,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private geolocation: Geolocation,
    private imagePicker: ImagePicker,
    private modalCtrl: ModalController
  ) { }

  getPicture(): Promise<CameraPhoto> {
    return new Promise((resolve, reject) => {
      let cameraOption: CameraOptions;
      cameraOption = {
        resultType: CameraResultType.DataUrl,
        allowEditing: true,
        // source: CameraSource.Photos
      };

      Camera.getPhoto(cameraOption).then((imageData) => {
        console.log("imgData",imageData)
        resolve(imageData);
      }, (err) => {
        reject(err);
      });
    });
  }

  takePhoto(isRatio = true) {
    return new Promise( async (resolve, reject) => {
      const actionSheet = await this.actionSheetCtrl.create({
        mode: 'md',
        header: 'Take Photo from',
        buttons: [{
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            console.log('take photo from camera');
            this._getCameraPicture('camera', isRatio).then((imageData) => {
              resolve(imageData);
            }).catch((err) => {
              reject(err);
            });
          }
        }, {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            console.log('take photo from gallery');
            this._getCameraPicture('gallery', isRatio).then((imageData) => {
              resolve(imageData);
            }).catch((err) => {
              reject(err);
            });
          }
        }],
        cssClass: 'take-photo-action-sheet'
      });
      await actionSheet.present();
    });
  }

  private _getCameraPicture(sourceType, isRadio) {
    return new Promise((resolve, reject) => {
      let cameraOption: camops;
      if (sourceType === 'camera') {
        cameraOption = {
          quality: 100,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          targetWidth: 200,
          targetHeight: 200,
          allowEdit: false,
          sourceType: this.camera.PictureSourceType.CAMERA
        };
      } else {
        cameraOption = {
          quality: 100,
          destinationType: this.camera.DestinationType.DATA_URL,
          sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
          targetWidth: 200,
          targetHeight: 200,
          allowEdit: false,
        };
      }
      if (!isRadio) {
        delete cameraOption.targetHeight;
        delete cameraOption.targetWidth;
      }
      this.camera.getPicture(cameraOption).then((imageData) => {
        console.log("imgData",imageData)
        resolve(imageData);
      }, (err) => {
        reject(err);
      });
    });
  }
  selectPhotos(isRatio = true) {
    return new Promise(async (resolve, reject) => {
      const actionSheet = await this.actionSheetCtrl.create({
        mode: 'md',
        header: 'Take Photo from',
        buttons: [{
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            console.log('take photo from camera');
            this._getSelectedPicture('camera', isRatio).then((imageData) => {             
              resolve(imageData);
            }).catch((err) => {
              reject(err);
            });
          }
        }, {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            console.log('take photo from gallery');
            this._getSelectedPicture('gallery', isRatio).then((imageData) => {
              console.log(imageData);
              resolve(imageData);
            }).catch((err) => {
              reject(err);
            });
          }
        }],
        cssClass: 'take-photo-action-sheet'
      });
      await actionSheet.present();
    });
  }

  private _getSelectedPicture(sourceType, isRadio) {
    return new Promise((resolve, reject) => {
      let cameraOption: camops;
      if (sourceType === 'camera') {
        cameraOption = {
          quality: 75,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          targetWidth: 640,
          targetHeight: 400,
          allowEdit: false,
          sourceType: this.camera.PictureSourceType.CAMERA
        };
        if (!isRadio) {
          delete cameraOption.targetHeight;
          delete cameraOption.targetWidth;
        }
        this.camera.getPicture(cameraOption).then((imageData) => {
          let images=[];
          images.push(imageData);
          resolve(images);
        }, (err) => {
          reject(err);
        });
      } else {      
          let options: ImagePickerOptions;
        options = {
          quality: 75,
          width: 640,
          height: 400,
          outputType: 1,
        }
        this.imagePicker.getPictures(options).then((selectedImg) => {
          resolve(selectedImg);
        }, (err) => {
          reject(err);
        });       
      }
    });
  }

  makeFilename() {
    const fn = Math.random().toString(36).substring(7) + '.jpg';
    return fn;
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 3000
    });
    return await loading.present();
  }

  hideLoading() {
    this.loadingCtrl.dismiss();
  }

  async presentAlert(h, msg) {
    const alert = await this.alertCtrl.create({
      header: h,
      message: msg,
      buttons: ['OK'],
      cssClass: 'simple-alert',
      mode: 'ios'
    });
    await alert.present();
  }

  async presentWarningAlert(msg) {
    const alert = await this.alertCtrl.create({
      header: 'Warning!',
      message: msg,
      buttons: ['OK'],
      cssClass: 'warning-alert',
      mode: 'ios'
    });
    await alert.present();
  }

  async presentErrorAlert(msg) {
    const alert = await this.alertCtrl.create({
      header: 'Error!',
      message: msg,
      buttons: ['OK'],
      cssClass: 'error-alert',
      mode: 'ios'
    });
    await alert.present();
  }

  async presentAlertWithOptions(msg, btn) {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: 'Error!',
        message: msg,
        cssClass: 'error-alert',
        mode: 'ios',
        backdropDismiss: false,
        buttons: [{
          text: btn,
          cssClass: 'primary',
          handler: () => {
            resolve(true);
          }
        }]
      });
      await alert.present();
    });
  }

  async presentToast(msg, mode = 'md') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top',
      mode: mode === 'md' ? 'md' : 'ios',
      cssClass: 'simple-toast'
    });
    toast.present();
  }

  async presentErrorToast(msg, mode = 'md') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top',
      mode: mode === 'md' ? 'md' : 'ios',
      cssClass: 'error-toast'
    });
    toast.present();
  }

  validInputPattern($event: any, mode) {
    const key = $event.target.value;
    let regex, singleRegex;
    switch (mode) {
      case '1':
        regex = /^\d+$/;
        singleRegex = /^[0-9]$/;
        break;
      case 'a':
        regex = /^[a-zA-Z]+$/;
        singleRegex = /^[A-Za-z]$/;
        break;
      case 'n':
        regex = /^[a-zA-Z ]+$/;
        singleRegex = /^[A-Za-z ]$/;
        break;
      default:
        break;
    }
    if (!regex.test(key)) {
      const result = [];
      const data = $event.target.value.split('');
      data.forEach(c => {
        if (singleRegex.test(c)) {
          result.push(c);
        }
      });
      // let result = $event.target.value.match(regex);
      $event.target.value = result ? result.join('') : '';
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition({ timeout: 3000, enableHighAccuracy: false }).then((positon) => {
        resolve({
          lat: positon.coords.latitude,
          lng: positon.coords.longitude
        });
      }).catch((err) => {
        console.warn('getCurrentPosition', err);
        reject(false);
      });
    });
  }

  generateYearList() {
    const d = new Date();
    const year = d.getFullYear();
    const yearArr = [];
    for (let i = year; i > (year - 60); i--) {
      yearArr.push('' + i);
    }
    return yearArr;
  }

  async getNearbyLocations(){
    var coords;
    this.getCurrentPosition().then(res => {
      coords = res;
    });
    var loc = new google.maps.LatLng(coords.lat,coords.lng);
  
    var request = {
      location: loc,
      radius: '100',
    }; 
    var map = new google.maps.Map(document.getElementById('map'), {
      center: loc,
      zoom: 15
    });
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (res)=>{
      return res;
    });
  }
}
