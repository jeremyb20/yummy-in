import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthServices } from 'src/app/common/services/auth.service';
import { FormControl } from "@angular/forms";
import { Subscription } from 'rxjs';
import {Location} from '@angular/common';

import Swal from 'sweetalert2/dist/sweetalert2.js';
import { MediaResponse, MediaService } from '../common/services/media.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { CompanyService } from '../common/services/company.service';
import { NotificationService } from '../common/services/notification.service';
declare var $: any;

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent implements OnInit, OnDestroy {
  // private localUserSubscription : Subscription;
  public searchControl: FormControl;
  private mediaSubscription: Subscription;

  userLogged: any;
  user : any;
  Media: MediaResponse;
  restaurantMenu: any;

  showToolbarMenu: boolean = true;
  showMapInfo: boolean = false;
  example: [];
  index: number;

  constructor(private authService: AuthServices, private media: MediaService, private router: Router, private companyService: CompanyService,private _notificationSvc: NotificationService, private _location: Location) {
      //this.located = false;
      this.userLogged = this.authService.getLocalUser()
      this.user = JSON.parse(this.userLogged);
      if(this.user != null){
        switch (this.user.userState) {
          case 1:
            this.router.navigate(['/dashboard-user-menus']);
            break;
          default:
            break;
        }
      }else{
        this.router.navigate(['/home']);
        localStorage.clear();
        return;
      }
      this.mediaSubscription = this.media.subscribeMedia().subscribe(media => {
        this.Media = media;
      });
  }

  ngOnInit() {
   this.getListAllMenu();
  }

  ngOnDestroy(){
    if(this.mediaSubscription){
      this.mediaSubscription.unsubscribe();
    }
  }

  getListAllMenu() {
    this.companyService.getRestaurantMenuList().subscribe(data => {
      if(data.length>0) {
        this.restaurantMenu = data;
        // this.restaurantMenu.forEach(function(element, index) {

        //   console.log(index);
        //   element.newMenu.slice(0,6)
        // });
        
        
        // for (let value of this.restaurantMenu) {
        //   value.newMenu.slice(0,6)                                      /// este va sirviendo 
        //   console.log(value.newMenu.slice(0,6));  
        // }


      }
    },
    error => {
      $('#newMenuModal').modal('hide');
      this._notificationSvc.warning('Hola '+this.user.companyName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  goBack() {
    this._location.back();
  }
}
