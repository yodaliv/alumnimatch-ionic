import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BulletinboardPage } from './bulletinboard.page';
import { DirectivesModule } from 'src/app/_directives/directives.module';
import { SharedModule } from 'src/app/_shared/shared.module';
import { PostDetailsPage } from './post-details/post-details.component';
import { AddPostComponent } from './add-post/add-post.component';
import { PipesModule } from 'src/app/_pipes/pipes.module';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { FilterPostComponent } from './filter-post/filter-post.component';
import { PostPhotosViewComponent } from './post-photos-view/post-photos-view.component';

const routes: Routes = [
  {
    path: '',
    component: BulletinboardPage,
  },
  {
    path: 'details/:id',
    component: PostDetailsPage,
  },
  {
    path: 'photos/:id',
    component: PostPhotosViewComponent,
  },
  {
    path: 'details/:id/:focus',
    component: PostDetailsPage,
  },
  {
    path: 'filter/:id',
    component: BulletinboardPage,
  },
];

@NgModule({
  imports: [NgxLinkifyjsModule,PipesModule, CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), DirectivesModule, SharedModule],
  entryComponents: [FilterPostComponent],
  declarations: [BulletinboardPage, PostDetailsPage, FilterPostComponent,PostPhotosViewComponent],
})
export class BulletinboardPageModule {}
