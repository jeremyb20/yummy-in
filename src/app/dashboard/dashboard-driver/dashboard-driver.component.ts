import { Component, OnInit } from '@angular/core';
import {ILatLng} from '../../common/directives/directions-map.directive'
import { AuthServices } from 'src/app/common/services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-driver',
  templateUrl: './dashboard-driver.component.html',
  styleUrls: ['./dashboard-driver.component.scss']
})
export class DashboardDriverComponent implements OnInit {
  private localUserSubscription : Subscription

  zoom: number = 10;
  lat: number = 9.93040049002793;
  lng: number = -84.09062837772197;
  previous;
  coords: any;
  located: boolean;
  userLogged: any;
  user : any;
  showInfo: boolean = true;
  addDestiny: boolean = false;

  origin = { lat: 29.8174782, lng: -95.6814757 }
  destination = { lat: 40.6976637, lng: -74.119764 }
  waypoints = [
     {location: { lat: 39.0921167, lng: -94.8559005 }},
     {location: { lat: 41.8339037, lng: -87.8720468 }}
  ]

  constructor(private authService: AuthServices, private router : Router) {
      this.located = false;
      this.userLogged = this.authService.getLocalUser()
      this.user = JSON.parse(this.userLogged);
      if(this.user != null){
        switch (this.user.userState) {
          case 1:
            this.router.navigate(['/dashboard-user']);
            break;
          case 2:
            this.router.navigate(['/dashboard-driver']);
            break;

          case 3:
            this.router.navigate(['/dashboard-company']);
            break;

          default:
            break;
        }
      }else{
        this.router.navigate(['/home']);
        localStorage.clear();
        return;
      }
  }

  ngOnInit() {}

  clickedMarker(infowindow) {
    if (this.previous != undefined) {
      if( this.previous.close() != undefined)
          this.previous.close();
    }
    this.previous = infowindow;
  }
  
  mapClicked($event: MouseEvent) {
    var event: any;
      event = $event
    if(this.addDestiny){
      this.markers.push({
        lat: event.coords.lat,
        lng: event.coords.lng,
        draggable: true,
        isDestination: true,
        photo: this.user.photo
      });
    }else{
      if (this.markers.length < 1) {
        this.markers.push({
          lat: event.coords.lat,
          lng: event.coords.lng,
          draggable: true,
          isDestination: false,
          photo: this.user.photo
        });
      }
    }
    
  }
  

  markerDragEnd(m: marker, $event: MouseEvent) {
    this.origin = { lat: this.lat, lng: this.lng };
    this.destination = { lat: 24.799524, lng: 120.975017 };
    console.log('dragEnd', m, $event);
  }
  
  markers: marker[] = []

  getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(position => {
      this.markers.push({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        draggable: true,
        photo: this.user.photo
      });

      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      this.zoom = 17;
      this.located = true;
    });
  }

  changePosition(){
    this.showInfo = true;
    if(this.markers.length>0){
      this.markers.shift()
    }
  }

  savePosition() {
    this.showInfo = false;
    console.log(this.markers,'Guardar');
  }

  getDirection() {
    this.addDestiny = true;
   
    // Location within a string
    // this.origin = 'Taipei Main Station';
    // this.destination = 'Taiwan Presidential Office';
  }

}

interface marker {
	lat: number;
	lng: number;
	label?: string;
  draggable: boolean;
  photo: string;
  isDestination?: boolean;
}
