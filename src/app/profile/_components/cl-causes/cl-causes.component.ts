import { Component, OnInit } from '@angular/core';
import { CAUSES } from 'src/app/_config/current-life.constant';
import { ApiService } from 'src/app/_services/api.service';
import { ModalController } from '@ionic/angular';
import { UtilsService } from 'src/app/_services/utils.service';
import { DataService } from 'src/app/_services/data.service';
import { SearchModalComponent } from 'src/app/_shared/search-modal/search-modal.component';

@Component({
  selector: 'app-cl-causes',
  templateUrl: './cl-causes.component.html',
  styleUrls: ['./cl-causes.component.scss'],
})
export class ClCausesComponent implements OnInit {

  data: any[] = [{}];
  causes = CAUSES;
  selectCauseOption: any = {
    header: 'Select cause',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  modelCauses: any[] = [];

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private utils: UtilsService,
    private dataServ: DataService
  ) { }

  ngOnInit() {
    this.getCauses();
  }

  getCauses() {
    this.api.get('user/causes', true).subscribe((res: any[]) => {
      console.log('user/causes', JSON.stringify(res));
      if (res && res.length) {
        this.data = res;
        this.modelCauses = this.data.map(cause => cause.cause)
      } else {
        this.data = [{}];
      }
    }, (err) => {
      console.error('user/causes', err);
    });
  }

  onSubmit() {
    const filteredCauses = this.data.filter((item) => {
      if (item.hasOwnProperty('cause')) {
        return true;
      } else {
        return false;
      }
    });
    if (!filteredCauses.length) {
      this.utils.presentErrorAlert('Pelase select cause');
      return;
    }
    this.api.post('user/causes', this.data, true).subscribe((res) => {
      console.log('user/causes', res);
      this.modalCtrl.dismiss({success: true});
      this.dataServ.updateUserData({cl: {causes: this.data}})
    }, (err) => {
      console.error('user/causes', err);
    });
  }

  /* setCauses(event) {
    console.log('Event: ', JSON.stringify(event))
    //this.data = []
    this.modelCauses = event

    for (const eve of event) {
      if (!this.data.find(cause => cause.cause === eve)) {
        this.data.push({cause: eve});
      }
    }

    this.data = this.data.filter(pieceOfData => event.find(cause => cause === pieceOfData.cause) != null)

    console.log(this.modelCauses, JSON.stringify(this.data))
  } */

  async setCauses(event) {
    let causes = []

    if (this.data) {
      for (let pieceOfData of this.data) {
        causes.push(pieceOfData)
      }
    }

    console.log(this.data, this.causes)

    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        url: `auth/get-mos-by-code/__search/${this.causes}`,
        selectedItem: this.data.length > 0 ? this.data.map((cause) => {return {id: cause.cause}}) : null,
        multiple: true,
        title: 'Select Causes',
        items: this.causes.map((cause, index) => {return {id: index, name: cause}})
      },
      backdropDismiss: false,
    });
    modal.present();
    modal.onWillDismiss().then((res:any) => {
      if (res.data) {
        console.log("Res data: ", res.data)
        this.data = res.data.map((cause) => {return {cause: cause.id, scale: null, uid: this.dataServ.userInfo.user.id}})
      }
    });
  }

  removeCause(causeIndex) {
    console.log('Languages: ', JSON.stringify(this.data), ' - LanguageIndex to remove: ', JSON.stringify(causeIndex))
    this.data = this.data.filter((cause) => cause.cause !== causeIndex)
    this.modelCauses = this.data.map(cause => cause.cause)
  }

  addCause() {
    if (this.data.length === 0) {
      this.data.push({});
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
