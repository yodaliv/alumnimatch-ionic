import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ImageViewComponent } from 'src/app/home/messages/image-view/image-view.component';
import { DirectivesModule } from 'src/app/_directives/directives.module';
import { SharedModule } from 'src/app/_shared/shared.module';
import { ComposeMessageComponent } from './compose-message/compose-message.component';
import { MessageComponent } from './message/message.component';
import { MessagesPage } from './messages.page';

const routes: Routes = [
  {
    path: '',
    component: MessagesPage,
  },
  {
    path: 'user',
    component: MessageComponent,
  },
  {
    path: 'compose',
    component: ComposeMessageComponent,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), SharedModule, DirectivesModule],
  declarations: [MessagesPage, ComposeMessageComponent, MessageComponent, ImageViewComponent],
})
export class MessagesPageModule {}
