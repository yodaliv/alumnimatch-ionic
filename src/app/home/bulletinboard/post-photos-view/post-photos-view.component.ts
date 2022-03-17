import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavController, IonContent, ToastController, PopoverController, IonTextarea } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilsService } from 'src/app/_services/utils.service';
import { AnalyticsService } from 'src/app/_services/analytics.service';

@Component({
  selector: 'post-photos-view',
  templateUrl: './post-photos-view.component.html',
  styleUrls: ['./post-photos-view.component.scss']
})
export class PostPhotosViewComponent implements OnInit, AfterViewInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  isReply: boolean = false;
  load: any = {
    comments: 1,
    reply: 1,
  };
  setIndex: any = 0;
  selectedIndex: any = -1;
  comments: any[] = [];
  likes: any[] = [];
  comment: any = {};
  reportReason: string;
  isLoading = true;
  isFocus = false;
  isError = false;
  isDisabled = true;
  post: any = {};
  step: number = 1;
  users: any[] = [];
  usersProrate: any[] = [];
  categoriesProrate: any[] = [];
  postTypes: any[] = [];
  postTypesCategory: any[] = [];
  postType: number;
  postCategory: number;

  JSON: any;

  authPost: boolean = false

  currentUser: any;

  liked_users: any[] = [];
  tagging = false;
  hashtagging = false;
  tagSearch = "";
  taggedUsers: any[] = [];
  taggedCategory: any[] = [];
  taggedType: any[] = [];
  tagged: any = [];
  cmtReply: any = [];
  textValue: string;
  photos = [];
  photoTotal: any;
  photoUrl: any = [];

  loggedIn: boolean = false;
  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private alertController: AlertController,
    public toastController: ToastController,
    private _sanitizer: DomSanitizer,
    private utilServ: UtilsService,
    private analytics: AnalyticsService
  ) {
    this.JSON = JSON;

    const isFocus = this.route.snapshot.paramMap.get('focus');
    console.log('isFocus', isFocus);
    this.isFocus = isFocus === 'focus' ? true : false;

    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.comment = { ...this.comment, comment_user: this.currentUser };
    console.log(this.currentUser);
  }

  ngOnInit() {
    this.loggedIn = localStorage.token ? true : false;
    const postId = this.route.snapshot.paramMap.get('id');
    this._getPost(postId);
    this._getComments(postId);
    this._getLikes(postId);
    if(localStorage.token){ //we are logged in
      this.getTaggable();
      this.getPostCategory();
    }

    this.analytics.event_page_view({ page_title: "Post Details", post_id: postId })
  }
  ngAfterViewInit(): void {

  }

  getTaggable() {
    this.api.get('alumni/taggable').subscribe((res) => {
      this.users = res;
      console.log(res);
    });
  }

  tag(tag: any) {
    console.log(tag);
    let input = document.getElementsByName('comment')[0] as unknown as IonTextarea;
    if (tag.first_name) { //tagging a user

      input.value = input.value.substr(0, input.value.length - this.tagSearch.length - 1);
      this.tagSearch = '';
      this.tagging = false;
      input.value += '@' + tag.first_name + ' ' + tag.last_name;
      let name = input.name;
      let value = input.value;
      this.comment = { ...this.comment, [name]: value };
      if (this.taggedUsers.findIndex((tagged) => tagged.id === tag.id) === -1) {
        this.taggedUsers.push(tag)
      }
      this.tagged.push(tag.id);
      this.comment = { ...this.comment, 'tagged': this.tagged };
    }
    else { //tagging a category
      if (this.step == 1) {
        input.value = input.value.substr(0, input.value.length - this.tagSearch.length - 1);
        this.tagSearch = '';
        //this.hashtagging = false;
        input.value += '#' + tag.name + '|';
        let name = input.name;
        let value = input.value;
        this.comment = { ...this.comment, [name]: value };
        this.taggedType.push(tag);
        this.step = 2;
        this.postType = tag.id;
        this.getPostCategory();
      }
      else if (this.step == 2) {
        input.value = input.value.substr(0, input.value.length - this.tagSearch.length - 1);
        this.tagSearch = '';
        this.step = 3;
        input.value += '|' + tag.name + ' ';
        let name = input.name;
        let value = input.value;
        this.comment = { ...this.comment, [name]: value };
        this.taggedCategory.push(tag);
      }
    }

    /* setTimeout(() => {
      input.setFocus()
    }, 500) */

  }

  getPostCategory() {
    let url = this.step === 2 ? `post/type-categories/${this.postType}` : 'post/types';

    this.api.get(url).subscribe(
      (res: any) => {
        console.log(res);
        if (this.step === 2) {
          this.postTypesCategory = res.data;
          this.categoriesProrate = this.postTypesCategory;
        }
        if (this.step === 1) this.postTypes = res.data;
      },
      ({ error }) => {
        console.error('getpostdataError', error);
        this.isError = error.message;
      }
    );
  }

  customizePost(post: any) {
    var postId = post.id;
    let data = {
      postId
    };
    this.api.post(`post/getNewJoin/${data.postId}`, data).subscribe(
      (res: any) => {
        console.log("Description: ", res);
        post.description = res.data.description;
        //this.newJoin = true;
      }), (err) => {
        console.error("newjoin customization error", err);
      };
  }

  ScrollToBottom() {
    this.content.scrollToBottom(1500);
  }

  _handleMessageInput(e) {
    this.isDisabled = e.target.value.length === 0 ? true : false;
    console.log(e, e.target, ((e.detail as any).target as HTMLInputElement).value);

    if ((e.detail as any).target.name == 'comment') {
      console.log("comment");
      switch ((e as any).detail.inputType) {
        /* case 'Shift' :
          break;
        case 'Tab' :
          break;
        case 'Ctrl' :
          break;
        case 'Alt' : 
          break; */
        case 'insertLineBreak':
          console.log("line break")
          if (this.tagging) {
            if (this.usersProrate.length == 0) {
              this.tagging = false;
              this.tagSearch = '';
              console.log('untagging user');
            }
          }
          break;
        case 'deleteContentBackward':
          console.log("delete backwards")
          if (this.tagging) {
            this.tagSearch = this.tagSearch.substr(0, this.tagSearch.length - 1);

            if (this.tagSearch.length > 0) {
              this.usersProrate = this.users.filter((user) => {
                user.name = user.first_name + " " + user.last_name;
                return user.name.toLowerCase().includes(this.tagSearch.toLowerCase());
              });
            } else {
              //this.usersProrate = []
              if (!(e.target as HTMLInputElement).value.endsWith('@')) {
                this.tagging = false;
              } else {
                this.usersProrate = this.users
              }
              //this.tagSearch = '';
            }
          } else if (this.hashtagging) {
            this.tagSearch = this.tagSearch.substr(0, this.tagSearch.length - 1);
            console.log(this.tagSearch)
            if (this.tagSearch.length > 0) {
              if (this.step == 1) {
                this.categoriesProrate = this.postTypes.filter((category) => {
                  return category.name.toLowerCase().includes(this.tagSearch.toLowerCase());
                });
              } else if (this.step == 2) {
                this.categoriesProrate = this.postTypesCategory.filter((category) => {
                  return category.name.toLowerCase().includes(this.tagSearch.toLowerCase());
                });
              }
            } else {

              //this.categoriesProrate = []
              if (!(e.target as HTMLInputElement).value.endsWith('#')) {
                if (this.step === 2) {
                  this.step = 1;
                  (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.substring(0, (e.target as HTMLInputElement).value.lastIndexOf('#') + 1)
                  console.log("text:", (e.target as HTMLInputElement).value)
                  this.categoriesProrate = this.postTypes
                } else {
                  this.hashtagging = false;
                }
              } else {
                this.categoriesProrate = this.postTypes
              }
            }

          }
          break;
        case 'deleteHardLineBackward':
          this.hashtagging = false;
          this.tagging = false;
          this.tagSearch = ''
          break;
        case 'deleteWordBackward':
          this.tagSearch = ''
          if (this.hashtagging) {
            if (!(e.target as HTMLInputElement).value.endsWith('#')) {
              this.hashtagging = false;
            } else {
              this.categoriesProrate = this.postTypes
            }
          }

          if (this.tagging) {
            if (!(e.target as HTMLInputElement).value.endsWith('@')) {
              this.tagging = false;
            } else {
              this.usersProrate = this.users
            }
          }
          break;

        /* case '@' :
          this.tagging = true;
          this.tagSearch = '';
          console.log('tagging user');
          break;
        case ' ' :
          if(this.tagging){
            if(this.usersProrate.length == 0){
              this.tagging = false;
              this.tagSearch = '';
              console.log('untagging user');
            }
            else{
              this.tagSearch += e.key;
            }
          }
          break; */
        default:
          console.log("Default case")
          if ((e.detail as any).data === '#') { //Hashtagging
            this.hashtagging = true;
            this.tagging = false
            this.tagSearch = '';
            this.step = 1;
            console.log('tagging category');
            this.categoriesProrate = this.postTypes
          }
          else if ((e.detail as any).data === '@') { // @'ing a user
            this.tagging = true;
            this.hashtagging = false
            this.tagSearch = '';
            console.log('tagging user');
            this.usersProrate = this.users
          } else if ((e.detail as any).data === ' ') { // stop doing whatever they were doing before
            if (this.tagging) {
              if (this.usersProrate.length == 0) {
                this.tagging = false;
                this.tagSearch = '';
                console.log('untagging user');
              }
              else if (this.hashtagging) {
                if (this.categoriesProrate.length == 0) {
                  this.hashtagging = false;
                  this.tagSearch = '';
                  console.log('untagging category');
                }
              }
              else if (this.step == 2) {
                if (this.categoriesProrate.length == 0) {
                  this.hashtagging = false;
                  this.tagSearch = '';
                  console.log('untagging category');
                }
              }
              else {
                this.tagSearch += (e.detail as any).data;
              }
            }
          } else {
            this.tagSearch += (e.detail as any).data;
            if (this.tagging) {
              this.usersProrate = this.users.filter((user) => {
                user.name = user.first_name + " " + user.last_name;
                return user.name.toLowerCase().includes(this.tagSearch.toLowerCase());
              });
            }
            if (this.hashtagging) {
              this.categoriesProrate = this.postTypes.filter((category) => {
                return category.name.toLowerCase().includes(this.tagSearch.toLowerCase());
              });
            }
            if (this.step == 2) {
              this.categoriesProrate = this.postTypesCategory.filter((category) => {
                return category.name.toLowerCase().includes(this.tagSearch.toLowerCase());
              });
            }
          }

          break;
      }
    }
    this.comment = { ...this.comment, [(e.detail as any).target.name]: (e.detail as any).target.value };
    console.log(this.comment);
  }

  _getPost(postId) {
    this.isLoading = true;
    this.api.post(localStorage.token ? `post/${postId}` : `post/guest/temp/${postId}`, { isAuth: true }).subscribe(
      (res: any) => {
        this.post = { ...res.data };
        if (this.post && (this.post.photoUrl)) {
          this.photos = this.post.photoUrl.split(',');
          this.photoTotal = this.photos.length;
          this.photos.forEach((res, i) => {
            res = res.trim();
            this.photoUrl.push(res);
          })
        }
        this.isLoading = false;
        console.log("Post", res);
        if (this.post.embed) {
          this.sanitize(this.post);
        }

        if(localStorage.token){ //we are logged in
          const currentUser = JSON.parse(localStorage.getItem('user'));
          if (currentUser.id === this.post.user.id) {
            this.authPost = true
          }
        }

        if (!this.post.description) {
          this.customizePost(this.post);
        }

      },
      (err) => {
        console.error('get_post_error', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }
  previousItem() {
    this.setIndex = this.setIndex - 1;
  }
  nextItem() {
    this.setIndex = this.setIndex + 1;
  }
  _checkLike() {
    const loggedUserId = this.comment.comment_user.id;
    console.log('loggedUserId', loggedUserId);
    console.log('likes', this.likes);
    const isLiked = this.likes.findIndex((l) => l.likedBy === loggedUserId);

    this.post.isLiked = isLiked !== -1
  }

  _getLikes(postId) {
    this.isLoading = true;
    this.api.get(localStorage.token ? `post/likes/${postId}` : `post/guest/likes/${postId}`).subscribe(
      (res: any) => {
        this.likes = res.data;
        this.isLoading = false;
        this._checkLike();
        console.log(res);
        this.liked_users = this.likes.map((like) => { return like.like_by })
      },
      (err) => {
        console.error('get_post_error', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  _getComments(postId) {
    this.api.get(localStorage.token ? `post/comments/${postId}?count=${this.comments.length}` : `post/guest/comments/${postId}?count=${this.comments.length}`).subscribe(
      (res: any) => {
        this.comments = this.comments.concat(res.data);
        if (res.data.length < 5) {
          this.load.comments = 2;
        } else {
          this.load.comments = 0;
        }

        this.comments.forEach((comment, i) => {
          this.getChildComments(comment.id, i)
        })
        console.log(res);
      },
      (err) => {
        console.error('get_post_error', err);
        this.isError = err.error.message;
      }
    );
  }

  async likePost(postId, type = 'like') {
    await this.utilServ.showLoading();

    let postData: any = {
      type,
      postId
    };

    if (type === 'comment') {
      postData.comment = this.comment.comment;
      this.taggedUsers.forEach((user) => {
        //if ((this.post.comment as string).includes(`@${user.first_name} ${user.last_name}`)) {
        postData.comment = (postData.comment as string).split(`@${user.first_name} ${user.last_name}`).join(`@${user.first_name} ${user.last_name}#${user.id}`)
        //}
      });
      console.log(this.taggedType, this.taggedCategory);
      this.taggedType.forEach((type) => {
        postData.comment = (postData.comment as string).split(`#${type.name}`).join(`#${type.name}|${type.id}`);
      });
      this.taggedCategory.forEach((cat) => {
        postData.comment = (postData.comment as string).split(`|${cat.name}`).join(`|${cat.name}|${cat.id}`);
      });
      postData.tagged = this.tagged;
    }

    if (!this.post.isLiked || type === 'comment') {
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {
          if (type === 'comment') {
            this.comment.created_at = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en');
            this.comments = [...this.comments, this.comment];
            this.comment = { comment_user: this.currentUser };
            this.isDisabled = true;
          }

          if (type === 'like') {
            this.post.likes_count = this.post.likes_count + 1;
            this.post.isLiked = true;
            console.log(res)
            this.liked_users.push({ ...this.currentUser, online: 1 })
            //this.liked_users = this.likes.map((like) => {return like.like_by})
          }

          console.log(res.message);
          this.utilServ.hideLoading()
        },
        (err) => {
          console.error('getpostdataError', err);
          if (err.status >= 200 && err.status <= 299) {
            if (type === 'comment') {
              this.comment.created_at = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en');
              this.comments = [...this.comments, this.comment];
              this.comment = { comment_user: this.currentUser };
              this.isDisabled = true;
            }

            if (type === 'like') {
              this.post.likes_count = this.post.likes_count + 1;
              this.post.isLiked = true;
              this.liked_users.push({ ...this.currentUser, online: 1 })
            }
          } else {
            alert("An error has occurred. Error: " + JSON.stringify(err))
            console.error('getpostdataError' + ' ' + err.status, err);
            this.isError = err.error.message;
          }
          this.utilServ.hideLoading()
        }
      );
    } else if (this.post.isLiked && type === 'like') {
      postData.type = 'unlike'
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {

          this.post.likes_count = this.post.likes_count - 1;
          this.post.isLiked = false;
          console.log(res)
          const index = this.liked_users.findIndex((user) => this.currentUser.id === user.id)
          if (index !== -1) {
            this.liked_users.splice(index, 1)
          }
          //this.liked_users = this.likes.map((like) => {return like.like_by})


          console.log(res.message);
          this.utilServ.hideLoading()
        },
        (err) => {
          console.error('getpostdataError', err);
          if (err.status >= 200 && err.status <= 299) {

            if (type === 'like') {
              this.post.likes_count = this.post.likes_count - 1;
              this.post.isLiked = false;
              const index = this.liked_users.findIndex((user) => this.currentUser.id === user.id)
              if (index !== -1) {
                this.liked_users.splice(index, 1)
              }
              //this.liked_users.push({...this.currentUser, online: 1})
            }
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

  CommentReplyLike(i, commentId, reply, type) {
    const postId = this.route.snapshot.paramMap.get('id');
    let postData: any = {
      type: type,
      postId: postId,
      comment: reply,
      parent_comment: commentId,
    };
    if (type == 'comment') {
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {
          console.log("Res from comment: ", res)

          this.comments[i].childComment += 1;

          this.comments[i].childComments = [...this.comments[i].childComments, {
            childComment: 0,
            comment: reply,
            commentBy: this.currentUser.id,
            comment_user: this.currentUser,
            created_at: new Date(),
            //id: 131
            like: 0,
            parent_comment: commentId
          }]
          this.selectedIndex = -1;
          //this.commentReply(i,commentId);
          this.textValue = '';
        },
        (err: any) => {
          console.error('reportPostError', err);
        })
    }
    if (type == 'like') {
      this.api.get('post/comment/like/' + commentId).subscribe(
        (res: any) => {
          this.comments[i].like = 1;
        },
        (err: any) => {
          console.error('reportPostError', err);
        })
    }
    if (type == 'unlike') {
      this.api.get('post/comment/unlike/' + commentId).subscribe(
        (res: any) => {
          this.comments[i].like = 0;
        },
        (err: any) => {
          console.error('reportPostError', err);
        })
    }
  }
  async reportPost(postId) {
    const report = await this.presentAlert();
    const type = "report";
    var reason = this.reportReason;
    const postData: any = {
      type,
      postId,
      reason
    };
    console.log(postData);
    if (postData.reason !== "") {
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {
          this.presentToast();
          console.log(res);
        },
        (err) => {
          console.error('reportPostError', err);
          this.presentToast();
          this.isError = err.error.message;
        }
      );
    }
    else
      return; //Do nothing
  }

  removePost() {
    if (confirm("Are you sure you want to remove this post? This cannot be undone.")) {
      this.api.delete(`post/remove/${this.post.id}`).subscribe((res) => {
        console.log(res)
        if (res) {
          alert("Post successfully removed!")
          this.goBackandDelete()
        } else {
          alert("We could not remove your post. Please try again.")
        }
      }, err => {
        console.error(err)
        alert("Error removing your post. Error: " + JSON.stringify(err))
      })
    }
  }

  async presentAlert() {
    console.log("creating alert modal");
    const alert = await this.alertController.create({
      cssClass: 'reportAlert',
      header: 'Report',
      message: '<i>AlumniMatch does not tolerate harmful or dangerous content.</i> <p>Thank you for protecting our community!</p>',
      buttons: [
        {
          text: 'It infringes my rights',
          handler: () => {
            this.reportReason = "It infringes my rights";
          }
        },
        {
          text: "It's offensive or harmful",
          handler: () => {
            this.reportReason = "It's offensive or harmful";
          }
        },
        {
          text: "It's misleading",
          handler: () => {
            this.reportReason = "It's misleading";
          }
        },
        {
          text: "It's suspicious or Spam",
          handler: () => {
            this.reportReason = "It's suspicious or Spam";
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "cancel",
          handler: () => {
            this.reportReason = "";
          }
        }]
    }).then((e) => {
      e.present();
      return e.onDidDismiss();
    });
  }

  getChildComments(commentId, i) {
    const postId = this.route.snapshot.paramMap.get('id');

    this.api.get(localStorage.token ? `post/comments/${postId}/${commentId}?count=${this.cmtReply.length}` : `post/guest/comments/${postId}/${commentId}?count=${this.cmtReply.length}`).subscribe(
      (res: any) => {
        this.comments[i].childComments = res.data
        if (res.data.length < 5) {
          this.load.reply = 2;
        } else {
          this.load.reply = 0;
        }
        console.log("Comments: ", this.comments, res)
      },
      (err) => {
        console.error('get_post_error', err);
        this.isError = err.error.message;
      }
    );
  }
  composePost(postId: number) {
    this.navCtrl.navigateForward(`/home/bulletinboard/details/${postId}`);
  }
  commentReply(i, commentId) {

    if (this.selectedIndex == -1) {
      this.selectedIndex = i;
    } else {
      this.cmtReply = [];
      this.selectedIndex = -1;
    }

  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Post Successfully Reported.',
      color: 'success',
      duration: 2000,
      position: 'middle',
    });
    toast.present();
  }

  viewProfile(user) {
    console.log(user)
    if (user.id === this.currentUser.id) {
      return;
    }

    this.navCtrl.navigateForward('/home/user/' + user.id);
  }

  goBack() {
    this.navCtrl.navigateBack(`/home/bulletinboard`);
  }

  goBackandDelete() {
    let navigationExtras: NavigationExtras = {
      state: {
        id: this.post.id
      }
    };
    this.router.navigate([`/home/bulletinboard`], navigationExtras);
  }

  sanitize(post) {
    if (post.embed) {
      post.safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl("https://www." + post.embed);
      console.log(post.safeUrl);
    }
  }
}
