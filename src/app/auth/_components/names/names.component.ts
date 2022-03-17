import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-names',
  templateUrl: './names.component.html',
  styleUrls: ['./names.component.scss'],
})
export class NamesComponent implements OnInit {

  nameForm: FormGroup;

  validation_messages = {
    'email': [
      { type: 'pattern', message: `Invalid email` }
    ]
   };

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    const user = this.navParams.get('user');
    console.log('user', user);
    this.nameForm = this.formBuilder.group({
      first_name: new FormControl(user.first_name, [Validators.required, Validators.maxLength(50)]),
      last_name: new FormControl(user.last_name, [Validators.required, Validators.maxLength(50)]),
      email: new FormControl(user.email, [Validators.maxLength(50), Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gm))])
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    if (this.nameForm.valid) {
      this.modalCtrl.dismiss(this.nameForm.value);
    }
  }
}
