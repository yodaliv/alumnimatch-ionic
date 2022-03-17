import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonTextarea, ModalController, ToastController } from '@ionic/angular';
import { MatchOrderPipe } from 'src/app/_pipes/match-order.pipe';
import { AnalyticsService } from 'src/app/_services/analytics.service';
import { ApiService } from 'src/app/_services/api.service';
import { UtilsService } from 'src/app/_services/utils.service';
@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss'],
})
export class AddPostComponent implements OnInit {

  titles: any[] = ['Choose Post Type', 'Choose Post Type Category', 'Post Information', 'Post Creating'];
  title: string;
  step: number = 1;
  postTypes: any[] = [];
  postTypesCategory: any[] = [];
  isLast: boolean = false;
  isSubmitting: boolean = false;
  users: any[] = [];
  myColleges: any[] = [];
  usersProrate: any[] = [];
  categoriesProrate: any[] = [];
  post: any = {
    postTypeId: 23,
    postCategoryId: 119,
    publish_networks: false,
  };
  photosSet: any = [];
  isLoading = false;
  isError = false;
  errorMessage;
  JSON: any;
  imageFlag = true;
  tagging = false;
  hashtagging = false;
  tagSearch = "";
  taggedUsers: any[] = [];
  taggedCategory: any[] = [];
  taggedType: any[] = [];
  tagged: any = [];
  constructor(
    public viewCtrl: ModalController,
    private utils: UtilsService,
    public toastController: ToastController,
    private api: ApiService,
    private analytics: AnalyticsService,
    private matchPipe: MatchOrderPipe,
    private cdRef: ChangeDetectorRef
  ) {
    this.step = 1;
  }

  ngOnInit() {
    this._changeTitle();
    this.getPostCategory();
    this.getTaggable();
    this.getColleges();
    this.analytics.event_page_view({ page_title: "Add Post" })
  }

  getColleges() {
    this.api.get('user/college').subscribe((res) => {
      this.myColleges[0] = res.primary;
      Object.keys(res).forEach(key => {
        this.myColleges[key] = res[key];
      });
      console.log(this.myColleges);
    });
  }
  getTaggable() {
    this.api.get('alumni/taggable').subscribe((res) => {
      this.users = this.matchPipe.transform(res);
      console.log(res);
    });
  }
  getPostCategory() {
    let url = this.step === 2 ? `post/type-categories/${this.post.postTypeId}` : 'post/types';

    this.api.get(url).subscribe(
      (res: any) => {
        if (this.step === 2) {
          this.postTypesCategory = res.data;
          this.categoriesProrate = this.postTypesCategory;
        }
        if (this.step === 1) this.postTypes = res.data;
      },
      ({ error }) => {
        console.error('getpostdataError', error);
        this.isError = error.message;
        this.errorMessage = JSON.stringify(error.message)
      }
    );
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }

  takePhoto() {
    this.utils
      .getPicture()
      .then((selectedImg) => {
        // selectedImg.forEach(i => {
          this.photosSet.push(selectedImg.dataUrl);
        // });
        console.log("photosurl",this.photosSet)
        this.post.photoUrl = JSON.stringify(this.photosSet);
      })
      .catch((err) => {
        console.error('err', err);
      });
  }
  deletePhoto(i) {
    this.photosSet.splice(i, 1);
    this.post.photoUrl = JSON.stringify(this.photosSet);
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Post Published Successfully.',
      color: 'success',
      duration: 2000,
      position: 'middle',
    });
    toast.present();
  }

  _handleSelection(e) {
    let value = e.detail.value;
    let type = this.step === 1 ? 'postTypeId' : 'postCategoryId';
    this.post = { ...this.post, [type]: value };
  }

  tag(tag: any) {
    console.log(tag);
    let input = document.getElementsByName('description')[0] as unknown as IonTextarea;
    if (tag.first_name) { //tagging a user

      input.value = input.value.substr(0, input.value.length - this.tagSearch.length - 1);
      this.tagSearch = '';
      this.tagging = false;
      input.value += '@' + tag.first_name + ' ' + tag.last_name;
      let name = input.name;
      let value = input.value;
      this.post = { ...this.post, [name]: value };
      if (this.taggedUsers.findIndex((tagged) => tagged.id === tag.id) === -1) {
        this.taggedUsers.push(tag)
      }
      this.tagged.push(tag.id);
      this.post = { ...this.post, 'tagged': this.tagged };
    }
    else { //tagging a category
      if (this.step == 1) {
        input.value = input.value.substr(0, input.value.length - this.tagSearch.length - 1);
        this.tagSearch = '';
        //this.hashtagging = false;
        input.value += '#' + tag.name + '|';
        this.post.postTypeId = tag.id;
        let name = input.name;
        let value = input.value;
        this.post = { ...this.post, [name]: value };
        this.taggedType.push(tag);
        this.step = 2;
        this.getPostCategory();
      }
      else if (this.step == 2) {
        input.value = input.value.substr(0, input.value.length - this.tagSearch.length - 1);
        this.tagSearch = '';
        this.step = 3;
        input.value += '|' + tag.name + ' ';
        this.post.postCategoryId = tag.id;
        let name = input.name;
        let value = input.value;
        this.post = { ...this.post, [name]: value };
        this.taggedCategory.push(tag);
      }
    }
    console.log("Input focus", input)

    /* setTimeout(() => {
      input.setFocus()
      
    }, 500) */
  }

  _handleInputChange(e: KeyboardEvent) {
    console.log(e, e.target, ((e.detail as any).target as HTMLInputElement).value);

    if ((e.detail as any).target.name == 'description') {
      console.log("Description")
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
    this.post = { ...this.post, [(e.detail as any).target.name]: (e.detail as any).target.value };
    console.log(this.post)
  }

  _handlePublish() {
    if(!this.isValid())
      return
    this.isSubmitting = true;
    let postData = { ...this.post, college: this.post.publish_networks ? JSON.stringify(this.post.colleges): null };
    console.log(postData, this.post)
    this.taggedUsers.forEach((user) => {
      //if ((this.post.description as string).includes(`@${user.first_name} ${user.last_name}`)) {
      postData.description = (postData.description as string).split(`@${user.first_name} ${user.last_name}`).join(`@${user.first_name} ${user.last_name}#${user.id}`)
      //}
    });
    console.log(this.taggedType, this.taggedCategory);
    this.taggedType.forEach((type) => {
      postData.description = (postData.description as string).split(`#${type.name}`).join(`#${type.name}|${type.id}`);
    });
    this.taggedCategory.forEach((cat) => {
      postData.description = (postData.description as string).split(`|${cat.name}`).join(`|${cat.name}|${cat.id}`);
    });
    console.log("Data being sent", postData)
    this.api.post('post/create-or-update', postData).subscribe(
      (res: any) => {
        console.log(res);
        this.dismiss();
        this.presentToast();
        this.isSubmitting = false;
      },
      ({ error }) => {
        console.error('getpostdataError', error);
        this.isSubmitting = false;
        this.isError = error.message;
        this.errorMessage = JSON.stringify(error.message)
      }
    );
  }

  _changeTitle() {
    this.isLast = true;
  }

  failure(image) {
    this.imageFlag = false;
    image.src = "/assets/imgs/no-image.png";
    console.log("Invalid Link");
  }
  success() {
    console.log("Image success")
    this.imageFlag = true;
  }

  checkImage() {
    let photoUrl = document.getElementById("photoUrl") as HTMLInputElement;
    if (photoUrl.value === '') {
      console.log("image is blank, submitting as textpost.");
      return true;
    }
    if (this.imageFlag) {
      console.log("image is complete " + this.imageFlag);
      return true;
    }
    console.log("image is invalid " + this.imageFlag);
    return false;
  }

  isValid() {
    var flag = true;
    let title = document.getElementById("title") as HTMLInputElement;
    let description = document.getElementById("description") as HTMLInputElement;
    let publish_network = document.getElementById("publish_network") as HTMLInputElement;
    let choose_network = document.getElementById("choose_network") as HTMLInputElement;
    //let summary = document.getElementById("summary") as HTMLInputElement;

    if (title.value === '') {
      document.getElementsByClassName("required")[0].classList.remove("hidden");
      flag = false;
    }
    else {
      document.getElementsByClassName("required")[0].classList.add("hidden");
    }
    if (description.value === '') {
      document.getElementsByClassName("required")[1].classList.remove("hidden");
      flag = false;
    }
    else {
      document.getElementsByClassName("required")[1].classList.add("hidden");
    }
    if (publish_network.checked && !this.post.colleges) {
      document.getElementsByClassName("required")[3].classList.remove("hidden");
      flag = false;
    }
    else {
      document.getElementsByClassName("required")[3].classList.add("hidden");
    }
    /* if (summary.value === ''){
      
      document.getElementsByClassName("required")[2].classList.remove("hidden");
      flag = false;
    }
    else{
      document.getElementsByClassName("required")[2].classList.add("hidden");
    } */
    console.log("submitting...");
    return flag;

  }


}
