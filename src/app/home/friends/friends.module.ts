import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DirectivesModule } from 'src/app/_directives/directives.module';
import { PipesModule } from 'src/app/_pipes/pipes.module';
import { SharedModule } from 'src/app/_shared/shared.module';
import { FriendsPage } from './friends.page';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    component: FriendsPage,
  },
  {
    path: ':segment',
    component: FriendsPage,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), SharedModule, DirectivesModule, PipesModule],
  declarations: [FriendsPage, SearchComponent],
  entryComponents: [SearchComponent],
})
export class FriendsPageModule {}
