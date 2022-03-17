import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonSlides, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent implements OnInit, OnDestroy {

  @ViewChild('previewSlides', {static: false}) previewSlides: IonSlides;

  @Input() postType: string;
  @Input() post: any;
  @Input() user: any;
  @Input() hideFooter: boolean = false

  photos = [];
  @Output() likePost: EventEmitter<any> = new EventEmitter();
  @Output() artificialComment: EventEmitter<any> = new EventEmitter();
  photoTotal: any;
  photoUrl: any = [];

  loggedIn: boolean = false;

  constructor(
    public navCtrl: NavController,
    private api: ApiService,
    private _sanitizer: DomSanitizer,
    private utils: UtilsService
  ) { }

  ngOnDestroy(): void {
        // TODO: Needs to autoplay when navigating back from post details, currently broken
    //this.previewSlides.stopAutoplay().catch((err) => console.error("Error stopping autoplay: ", err))
  }

  ngOnInit() {
    this.loggedIn = localStorage.token ? true : false;
    // TODO: Needs to autoplay when navigating back from post details, currently broken
    // setTimeout(() => {
    //   if (this.previewSlides) {
    //    this.previewSlides.startAutoplay().catch((err) => console.error("Error starting autoplay: ", err))
    //   }
    // }, 5000)
  }

  ngOnChanges(): void {
    if (this.post && (this.post.photoUrl)) {
      this.photoUrl = this.post.photoUrl.split(',');
      this.photoTotal = this.photoUrl.length;
      if (this.photoTotal > 1) {
        this.photoUrl.forEach((res, i) => {
          // if (i < 2) {
            res = res.trim();
            this.photos.push(res);
          // }
        })
      } else {
        this.photos.push(this.photoUrl);
      }
    }
  }

  ionViewDidEnter() {
    console.log("Entering")
    
  }

  ionViewWillLeave() {
    console.log("LEaving")
  }

  copyMessage(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.utils.presentAlert("Spread AlumniMatch to the world!","Your link is copied and ready to go!");
  }
  
  composePhoto(event: Event, postId: number) {
    event.stopPropagation()
    event.preventDefault()
    this.navCtrl.navigateForward(`/home/bulletinboard/photos/${postId}`);
  }

  composePost(postId: number) {
    this.navCtrl.navigateForward(`/home/bulletinboard/details/${postId}`);
  }

  likePostEvent(postId: number) {
    this.likePost.emit(postId)
  }

  artificialCommentEvent(postId: number, message: string) {
    let data = {
      postId: postId,
      message: message
    }
    this.artificialComment.emit(data);
  }

}
