import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonSearchbar, ToastController } from '@ionic/angular';
import { AgmMap } from '@agm/core';
import { UtilsService } from 'src/app/_services/utils.service';
import { ApiService } from 'src/app/_services/api.service';
import { GoogleMap } from '@agm/core/services/google-maps-types';
import { promise } from 'selenium-webdriver';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { RelativeTimePipe } from 'src/app/_pipes/relativeTime.pipe';

declare const google: any;

@Component({
  selector: 'app-nearby-map',
  templateUrl: './nearby-map.component.html',
  styleUrls: ['./nearby-map.component.scss'],
})
export class NearbyMapComponent implements OnInit {
  map: any;
  markers: any[] = [];
  @Input() center: any = {
    lat: 35.1592256,
    lng: -98.4422802
  };

  radius: number = 250;
  styles = new google.maps.StyledMapType([
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      }
    ]);
  data: any[];
  checkins: any[];
  checkedUsers: any[];
  place_id: any;
  infowindow = new google.maps.InfoWindow();
  place: any;
  relevant: any[];
  photo: any;
  alreadyChecked: any[];

  firstclick = false;
  

  constructor(
    private utils: UtilsService,
    private modalCtrl: ModalController,
    private api: ApiService,
    private cdRef: ChangeDetectorRef,
    private toastCtrl: ToastController,
    private relativeTime: RelativeTimePipe
    ) { }

  ngOnInit() {
    this.getCheckins().then(() => {
      this.getPosition();
    });
    
  }

  getPosition(){
    this.utils.getCurrentPosition().then((coords: any) => {
      if(coords){
        this.center = coords;
        console.log(this.center);
      }
      this.getNearbyLocations(this.center);
    }).catch((err) => {
      console.warn("Error with geolocation: ", err)
    });
  }

  async getCheckins(){
    await this.api.get('checkins').toPromise().then((res) =>{
      this.checkins = res;
      console.log(this.checkins);
    }).catch((err) => {
      console.warn("Error with getting check-in data: ", err)
    });
  }

  mapDblClick(e) {
    console.log('mapDblClick', e);
  
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

  getNearbyLocations(coords){
    var loc = new google.maps.LatLng(coords.lat,coords.lng);
  
    var request = {
      location: loc,
      radius: this.radius,
    }; 
     this.map = new google.maps.Map(document.getElementById('map'), {
      center: loc,
      zoom: 15,
    });
    var service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(request, (res: any[],status) => {
      console.log(status);
      console.log(res);
      this.data = res;
      for (var i = 0; i < res.length; i++) {
        this.createMarker(res[i]);
      }
    });

    var map = this.map;
    map.mapTypes.set('styled_map', this.styles);
    map.setMapTypeId("styled_map");
    var radius = this.radius;
    var center = this.center;

    var localCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.4,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.2,
      map,
      center: center,
      radius: radius * 1.1,
    });

  }

  createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
 
    var marker;
    var user = JSON.parse(localStorage.getItem('user'));
    this.relevant = this.checkins.filter((checkin) =>{
      return checkin.place_id == place.place_id
    })
    
    let icon = "../../../assets/icon/pin.png"
    if(this.checkins && this.relevant.length > 0) {
       icon = "../../../assets/icon/pingreen.png"
    }

      marker = new google.maps.Marker({
        map: this.map,
        position: place.geometry.location,
        icon: icon
      });
      google.maps.event.addListener(marker, "click", () => {
        this.relevant = this.checkins.filter((checkin) =>{
          return checkin.place_id == place.place_id
        })
        if(!this.firstclick){
          this.infowindow.open(this.map, marker);
          this.infowindow.close();
          this.firstclick = true;
        }
        this.alreadyChecked = this.relevant.filter((checkin) =>{
          return checkin.uid == user.id;
        }).map(checkin => {
          return {
            ...checkin,
            created_at: this.relativeTime.transform(checkin.created_at)
          }
        })
        // this.alreadyChecked = [];
        this.place_id = place.place_id;
        this.place = place;
        this.photo = null;
        var photos = place.photos ? true : false;
        this.photo = photos ? place.photos[0].getUrl() : null;
        this.checkedUsers = [];
        this.relevant = this.checkins.filter((checkin) =>{
          if(checkin.place_id == place.place_id){
            this.checkedUsers.push(checkin.user);
            return checkin;
          }
        });

        if(!this.infowindow.getMap()){ 
          this.infowindow.setMap(this.map);
        }

        this.infowindow.setContent(document.getElementById('infowindow'));
        this.infowindow.open(this.map, marker);
        this.cdRef.detectChanges();
      });
    //}

    this.markers.push(marker);
    
  }

  checkin() {
    var service = new google.maps.places.PlacesService(this.map);
    var request = {
      placeId: this.place_id,
    };
    var result: any;
    service.getDetails(request, (res)=>{
      console.log(res);
      result = res;
      var body = {
        place_id: this.place_id,
        name: result.name,
        //picture: result.photos ? result.photos[0].getUrl() : null, // This doesn't work, the maps API doesn't give us any direct, persistent URLs.
        rating: result.rating ? result.rating : null,
        coords: result.formatted_address ? result.formatted_address : null,
      }
      this.api.post('checkins/create',body).subscribe(async (res) => {
        console.log('Check-in successful!');
        const toast = await this.toastCtrl.create({
          message: "You're now checked in!",
          duration: 2000
        })
        await toast.present()
        // TODO: Update marker color && info window contents
        // TODO: Close the info window
      }),(err =>{
        console.error('Error creating check-in',err);
        alert(err)
      });
    });
  }

  mapReady(e) {
    
    this.map = e;

  }
}
