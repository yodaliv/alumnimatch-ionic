import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Ad, Company } from 'src/app/company/company.page';
import { AdService } from 'src/app/_services/ad.service';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { ApiService } from 'src/app/_services/api.service';
import { DataService, UserInfo } from 'src/app/_services/data.service';
import { UtilsService } from 'src/app/_services/utils.service';
import { AddPostComponent } from './add-post/add-post.component';
import { FilterPostComponent } from './filter-post/filter-post.component';

@Component({
  selector: 'app-bulletinboard',
  templateUrl: './bulletinboard.page.html',
  styleUrls: ['./bulletinboard.page.scss'],
})
export class BulletinboardPage implements OnInit, OnDestroy {
  postType = 'other';
  isLoading = true;
  isError: false;
  isLiked = false;
  posts: any[] = [];
  likes: any[] = [];
  ad: Ad;
  sponsor: Company;
  destroy: any;

  filter = 0;
  subscription: Subscription[] = []
  user: UserInfo;

  feed: any[] = [];
  index = 0;

  constructor(
    private navCtrl: NavController,
    private api: ApiService,
    public modalController: ModalController,
    private adServ: AdService,
    private route: ActivatedRoute,
    private router: Router,
    private _sanitizer: DomSanitizer,
    private utilServ: UtilsService,
    private dataServ: DataService,
    private cdRef: ChangeDetectorRef,
    private analytics: AnalyticsService,
    private utils: UtilsService
  ) {
    

    const sub1 = this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.destroy = this.router.getCurrentNavigation().extras.state.id;
      }
    });
    this.subscription.push(sub1)
    this.isLoading = true;
    
    
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => {
      sub.unsubscribe()
    })
  }

  ngOnInit() {
    this._getLikes();
    
    const filter: number = +this.route.snapshot.paramMap.get('id');
    console.log(filter);
    if(filter){
      this._handleFilter(filter);
      this.postType = 'filter';
    }
    else {
      this.getPosts(this.postType === 'other' ? false : true);
      const sub2 = this.dataServ.userStatusObs.subscribe((user) => {
        user.user.college = JSON.parse(localStorage.college)
        this.user = user
        console.log("Current User: ", this.user)
        this.cdRef.detectChanges();

      })
      this.subscription.push(sub2)
      this.analytics.event_page_view({page_title: 'Bulletin Board'})
  }
  }
  customizePosts(postIds: any[]) {
      var data = {
        postIds: postIds
      }
      this.api.post(localStorage.token ? `post/getNewJoin/0` : `post/getNewJoin/guest/0`, data).subscribe(
        (res: any) => {
          res.data.forEach(post=> {
            var p = this.posts.findIndex((p) => p.id == post.id);
            if(p) {
              post.match = this.posts[p].match;
              post.newJoin = this.posts[p].newJoin;
              post.type = this.posts[p].type;
              post.user = this.posts[p].user;
              post.category = this.posts[p].category;
              this.posts[p] = post;
            }
          });
        }), (err) => {
          console.error("newjoin customization error", err);
        };
  }

  ionViewWillEnter() {
    if(this.destroy){
      this.posts = this.posts.filter((p) => p.id !== this.destroy)
    }
    this.adServ.getRandomAd().then((res: any) => {
      if (res && res.ad && res.sponsor) {
        this.ad = res.ad
        this.sponsor = res.sponsor
      }
      
    }).catch((err) => {
      console.log("Get Ad error: ", err)
    })
  }

  doRefresh(event) {
    this.getPosts(false);
    event.target.complete();
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  changePostType($event) {
    this.isLoading = true;
    this.posts = [];
    this.postType = $event.target.value;
    if($event.target.value === 'other'){
      this.getPosts(false);
    }
    else if($event.target.value === 'own'){
      this.getPosts(true);
    }
    else if($event.target.value === 'friends'){
      this.getPostsByFriends();
    }
    else if($event.target.value === 'filter'){
      this._handleFilter(0);
    }
  }

  getPostsByFriends() {
    this.isLoading = true;
    var postIds = [];
    var loggedUserId = 0;
    if(localStorage.token){
      const currentUser = JSON.parse(localStorage.getItem('user'));
      loggedUserId = currentUser.id;
    }
    this.api.post('post/advanced/getFriendPosts', { isAuthPost: false }).toPromise().then(
      (res: any) => {
        console.log(res)
        if(res.data){
          this.posts = res.data.data;
          this.feed = this.posts.slice(this.index = 0,this.index+=30);
          var likedPosts = this.likes.filter((l) => l.likedBy === loggedUserId);
          var incr;
          for (incr = 0; incr < likedPosts.length; incr++) {
            let findPost = this.posts.find((p) => p.id === likedPosts[incr].postId);
            if(findPost)
              findPost.isLiked = true;
          }
          /* this.posts.forEach(post => {
            if(post.embed){
              this.sanitize(post);
            }
          }); */
          console.log(this.posts);
          this.isLoading = false;
          
          this.posts.forEach(post => {
              if (!post.description) {
                postIds.push(post.id);
                post.newJoin = true;
              }
              else if(post.description.length > 300){
                post.descriptionTruncate = post.description.slice(0,300).concat('...');
                post.truncate = true;
              }
  
              if (post.embed) {
                post.safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl("https://www." + post.embed);
              }
          });
        } else {
          this.posts = [];
          this.feed = [];
          this.isLoading = false;
        }
        if(postIds.length > 0)
          this.customizePosts(postIds);
      }).catch((err) => {
        console.error('getpostdataError', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  loadPosts(event){
    this.feed.push(...this.posts.slice(this.index,this.index+=20));
    
    console.log(this.index);
    event.target.complete();
  }

  getPosts(isAuthPost: boolean) {
    this.isLoading = true;
    var postIds = [];
    var loggedUserId = 0;
    if(localStorage.token){
      const currentUser = JSON.parse(localStorage.getItem('user'));
      loggedUserId = currentUser.id;
    }
    this.api.post(localStorage.token ? 'post' : 'post/guest/temp', { isAuthPost }).toPromise().then(
      (res: any) => {
        this.posts = res.data;
        this.feed = this.posts.slice(this.index = 0,this.index+=30);
        var likedPosts = this.likes.filter((l) => l.likedBy === loggedUserId);
        var incr;
        for (incr = 0; incr < likedPosts.length; incr++) {
          let findPost = this.posts.find((p) => p.id === likedPosts[incr].postId);
          if(findPost)
            findPost.isLiked = true;
        }
        /* this.posts.forEach(post => {
          if(post.embed){
            this.sanitize(post);
          }
        }); */
        console.log(this.posts);
        this.isLoading = false;
        
        this.posts.forEach(post => {
            if (!post.description) {
              postIds.push(post.id);
              post.newJoin = true;
            }
            else if(post.description.length > 300){
              post.descriptionTruncate = post.description.slice(0,300).concat('...');
              post.truncate = true;
            }

            if (post.embed) {
              post.safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl("https://www." + post.embed);
            }
        });
        if(postIds.length > 0)
          this.customizePosts(postIds);
      }).catch((err) => {
        console.error('getpostdataError', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  composePost(postId: number) {
    this.navCtrl.navigateForward(`/home/bulletinboard/details/${postId}`);
  }

  async _handleNewPost() {
    console.log('test');
    const modal = await this.modalController.create({
      component: AddPostComponent,
    });

    modal.onDidDismiss().then(() => {
      this.getPosts(true);
      this.postType = 'own';
    });

    return await modal.present();
  }

  async _handleFilter(filter) {
    console.log('filtering...');
    if(filter > 0){
      let url = `post/guest/categories`
      this.api.post(url, {postCategoryIds: [filter]}).subscribe(
        (res: any) => {
          this.posts = res.data;
          this.feed = this.posts.slice(this.index = 0,this.index+=30);
          this.isLoading = false;
        },
        ({ error }) => {
          console.error('getpostdataError', error);
          this.isLoading = false;
          this.isError = error.message;
        }
      );
    }
    else {
      const modal = await this.modalController.create({
      component: FilterPostComponent,
    });
    modal.onDidDismiss().then((posts) => {
      this.posts = posts.data[0];
      this.feed = this.posts.slice(this.index = 0,this.index+=30);
      this.isLoading = false;
    });

    return await modal.present();
    }
    
  }

  _checkLike(postId) {
    var loggedUserId = 0;
    if(localStorage.token){
      const currentUser = JSON.parse(localStorage.getItem('user'));
      loggedUserId = currentUser.id;
    }
    console.log('likes', this.likes.filter((l) => l.likedBy === loggedUserId && l.postId === postId).length);
    let isLiked = this.likes.filter((l) => l.likedBy === loggedUserId && l.postId === postId).length;
    return isLiked === 0 ? false : true;
  }

  _getLikes() {
  
    this.api.get(localStorage.token ? `post/likes` : `post/guest/likes`).subscribe(
      (res: any) => {
        this.likes = res.data;
        //this.isLoading = false;
        console.log('likes', res);
      },
      (err) => {
        console.error('get_post_error', err);
        //this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  async likePost(postId) {
    await this.utilServ.showLoading()
    if (!this._checkLike(postId)) {
      let postData = {
        type: 'like',
        postId,
      };
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {
          let findPost = this.posts.find((p) => p.id === postId);
          findPost.likes_count += 1;
          findPost.isLiked = true;
          console.log(res.data);
          this._getLikes();
          console.log('like success: '+ findPost.likes_count);
          this.utilServ.hideLoading()
        },
        (err) => {
          if(err.status >= 200 && err.status <= 299) {
            let findPost = this.posts.find((p) => p.id === postId);
            findPost.likes_count += 1;
            findPost.isLiked = true;
            console.log(err);
            this._getLikes();
            console.log('like success: '+ findPost.likes_count);
          }
          else {
            console.error('getpostdataError', err);
          }
          this.utilServ.hideLoading()
        }
      );
    } else {
      let postData = {
        type: 'unlike',
        postId,
      };
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {
          let findPost = this.posts.find((p) => p.id === postId);
          findPost.likes_count -= 1;
          findPost.isLiked = false;
          console.log(res.data);
          this._getLikes();
          console.log('like success: '+ findPost.likes_count);           
            //this.liked_users = this.likes.map((like) => {return like.like_by})

          console.log(res.message);
          this.utilServ.hideLoading()
        },
        (err) => {
          console.error('getpostdataError', err);
          if (err.status >= 200 && err.status <= 299) {


              let findPost = this.posts.find((p) => p.id === postId);
              findPost.likes_count -= 1;
              findPost.isLiked = false;
              console.log(err);
              this._getLikes();
              console.log('like success: '+ findPost.likes_count);
              //this.liked_users.push({...this.currentUser, online: 1})
          } else {
            alert("An error has occurred. Error: " + JSON.stringify(err))
            console.error('getpostdataError' + ' ' + err.status, err);
            this.isError = err.error.message;
          }
          this.utilServ.hideLoading()
        }
      );
    }
  }

  sanitize(post){
    if(post.embed){
      post.safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl("https://www."+post.embed);
      console.log(post.safeUrl);
    }
  }

  async artificialComment(data){
    let postData: any = {
      type : "comment",
      postId : data.postId,
      comment : data.message
    };
    this.api.post('post/reaction', postData).subscribe(
      (res: any) => {
        console.log(res.message);
        this.utilServ.hideLoading();
        this.composePost(data.postId);
      },
      (err) => {
          console.error('getpostdataError', err);
          alert("An error has occurred. Error: " + JSON.stringify(err))
          console.error('getpostdataError' + ' ' + err.status, err);
          this.isError = err.error.message;
        });
      }
}
