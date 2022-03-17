import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { environment } from 'src/environments/environment';
import { QuestionsComponent } from '../auth/questions/questions.component';
import { DirectivesModule } from '../_directives/directives.module';
import { PipesModule } from '../_pipes/pipes.module';
import { RelativeTimePipe } from '../_pipes/relativeTime.pipe';
import { AdSlidesComponent } from './ad-slides/ad-slides.component';
import { AdSmComponent } from './ad-sm/ad-sm.component';
import { AdComponent } from './ad/ad.component';
import { AlumniLoadingComponent } from './alumni-loading/alumni-loading.component';
import { AlumniModalComponent } from './alumni-modal/alumni-modal.component';
import { AlumniSlidesComponent } from './alumni-slides/alumni-slides.component';
import { AlumniSmComponent } from './alumni-sm/alumni-sm.component';
import { AlumniComponent } from './alumni/alumni.component';
import { DetailMessageModalComponent } from './detail-message-modal/detail-message-modal.component';
import { LoadingComponent } from './loading/loading.component';
import { LocationOptionModalComponent } from './location-option-modal/location-option-modal.component';
import { MessageComponent } from './message/message.component';
import { MoreInfoComponent } from './more-info/more-info.component';
import { NearbyMapComponent } from './nearby-map/nearby-map.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PickLocationModalComponent } from './pick-location-modal/pick-location-modal.component';
import { PostPreviewComponent } from './post-preview/post-preview.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { SelectAlumniModalComponent } from './select-alumni-modal/select-alumni-modal.component';
import { SelectModalComponent } from './select-modal/select-modal.component';
import { SelectPostCategoryComponent } from './select-post-category/select-post-category.component';
import { SelectTagUserComponent } from './select-tag-user/select-tag-user.component';
import { SendMessageModalComponent } from './send-message-modal/send-message-modal.component';
import { SponsorComponent } from './sponsor/sponsor.component';
import { UsersListComponent } from './users-list/users-list.component';

@NgModule({
  declarations: [
    SelectModalComponent,
    PickLocationModalComponent,
    MoreInfoComponent,
    AlumniSlidesComponent,
    AlumniSmComponent,
    MessageComponent,
    AlumniComponent,
    LocationOptionModalComponent,
    SendMessageModalComponent,
    DetailMessageModalComponent,
    AlumniLoadingComponent,
    AlumniModalComponent,
    SelectAlumniModalComponent,
    QuestionsComponent,
    LoadingComponent,
    AdComponent,
    SponsorComponent,
    AdSlidesComponent,
    AdSmComponent,
    SearchModalComponent,
    SponsorComponent,
    SelectTagUserComponent,
    PostPreviewComponent,
    SelectPostCategoryComponent,
    NotificationsComponent,
    NearbyMapComponent,
    UsersListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DirectivesModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GOOGLEMAP_APIKEY,
      libraries: ['places'],
    }),
    PipesModule,
    NgxLinkifyjsModule,
  ],
  entryComponents: [
    AdComponent,
    SelectModalComponent,
    SearchModalComponent,
    PickLocationModalComponent,
    MoreInfoComponent,
    LocationOptionModalComponent,
    SendMessageModalComponent,
    DetailMessageModalComponent,
    AlumniModalComponent,
    SelectAlumniModalComponent,
    NotificationsComponent,
    NearbyMapComponent,
    UsersListComponent,
  ],
  exports: [
    SelectModalComponent,
    PickLocationModalComponent,
    MoreInfoComponent,
    AlumniSlidesComponent,
    AlumniSmComponent,
    MessageComponent,
    AlumniComponent,
    LocationOptionModalComponent,
    SendMessageModalComponent,
    DetailMessageModalComponent,
    AlumniLoadingComponent,
    AlumniModalComponent,
    QuestionsComponent,
    SelectAlumniModalComponent,
    LoadingComponent,
    AdComponent,
    AdSlidesComponent,
    AdSmComponent,
    SearchModalComponent,
    SponsorComponent,
    SelectTagUserComponent,
    PostPreviewComponent,
    SelectPostCategoryComponent,
    NotificationsComponent,
    NearbyMapComponent,
    UsersListComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [RelativeTimePipe],
})
export class SharedModule {}
