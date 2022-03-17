import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-login-messages',
  templateUrl: './login-messages.component.html',
  styleUrls: ['./login-messages.component.scss'],
})
export class LoginMessagesComponent implements OnInit {
  @Input() header: string;
  @Input() body: string;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  close() {
    this.modalCtrl.dismiss()
  }
}
