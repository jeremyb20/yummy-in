import { Component, ElementRef, NgZone, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription, from } from 'rxjs';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { MediaResponse, MediaService } from '../../common/services/media.service';
import { darkStyle, lightStyle } from '../../common/constants/map-theme';
import * as moment from 'moment';
import { CompanyService } from 'src/app/common/services/company.service';
import { NewMenuResponse } from './dashboard-company-response'
import { NotificationService } from 'src/app/common/services/notification.service';
import { Router } from '@angular/router';
declare var $: any;
declare const google: any; 

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

@Component({
  selector: 'app-dashboard-company',
  templateUrl: './dashboard-company.component.html',
  styleUrls: ['./dashboard-company.component.scss']
})
export class DashboardCompanyComponent implements OnInit, OnDestroy {
  private mediaSubscription: Subscription;
  @Input() cost;
  newMenuForm: FormGroup;
  submitted = false;
  userLogged: any;
  user : any;
  Media: MediaResponse;
  id: number = 1;
  myfoodMenu: NewMenuResponse[] = [];
  showPanelMenuItem:any;
  timeSeconds: number =  6000;
  file : File;
  photoSelected: String | ArrayBuffer;
  showEditMenu: boolean = false;
  loading: boolean = false;
  hideMsg: boolean = false; 
  ShowMsg: string;


  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(private companyService: CompanyService, private media: MediaService, private formBuilder: FormBuilder, private _notificationSvc: NotificationService, private router: Router) {
      this.userLogged = this.companyService.getLocalCompany()
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

      this.mediaSubscription = this.media.subscribeMedia().subscribe(media => {
        this.Media = media;
      });

      this.getMyListMenu()
  }

  get f() { return this.newMenuForm.controls; }

  ngOnInit() {
    this.newMenuForm = this.formBuilder.group({
      foodName: ['', Validators.required],
      cost: ['', [Validators.minLength(3),Validators.required,Validators.pattern(/\d/)]],
      description: ['', Validators.required],
    });
  }

  getMyListMenu(){
    this.showEditMenu = false;
    this.companyService.getMyMenuList(this.user.id).subscribe(data => {
      if(data.length>0) {
        this.myfoodMenu = data;
        this.showPanelMenuItem = this.myfoodMenu.slice(-1).pop();
      }
    },
    error => {
      $('#newMenuModal').modal('hide');
      this._notificationSvc.warning('Hola '+this.user.companyName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  showPanelMenu(item:any) {
    this.showPanelMenuItem = item;
  }

  editMenuSelected(item:any) {
    this.showPanelMenuItem = item;
    this.showEditMenu = true;
    this.newMenuForm = this.formBuilder.group({
      foodName: [item.foodName, [Validators.required]],
      cost: [item.cost, [Validators.minLength(3),Validators.required,Validators.pattern(/\d/)]],
      description: [item.description, [Validators.required]],
    });
    $('#newMenuModal').modal('show');
  }

  updateMenuItemSelected(){
    this.submitted = true;
    if (this.newMenuForm.invalid) {
        return;
    }
    var updateItemMenu = {
      foodName: this.f.foodName.value,
      description: this.f.description.value,
      cost: this.f.cost.value,
      idCompany: this.showPanelMenuItem.idCompany,
      _id: this.showPanelMenuItem._id
    }

    this.companyService.updateNewMenu(updateItemMenu,this.file).subscribe(data => {
      if(data.success) {
        $('#newMenuModal').modal('hide');
        this._notificationSvc.success('Hola '+this.user.companyName+'', data.msg, 6000);
        this.showEditMenu = false;
        this.newMenuForm = this.formBuilder.group({
          foodName: ['', Validators.required],
          cost: ['', [Validators.minLength(3),Validators.required,Validators.pattern(/\d/)]],
          description: ['', Validators.required],
        });
        this.getMyListMenu();
      } else {
        $('#newMenuModal').modal('hide');
        this._notificationSvc.warning('Hola '+this.user.companyName+'', data.msg, 6000);
      }
    },
    error => {
      $('#newMenuModal').modal('hide');
      this._notificationSvc.warning('Hola '+this.user.companyName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  deleteMenuSelected(item:any) {
    Swal.fire({
      title: 'Eliminar '+item.foodName,
      html: "Estas seguro de eliminar este menu?",
      showCancelButton: true,
      allowEscapeKey: false,
      confirmButtonText: 'OK',
      cancelButtonText: 'No',
      allowOutsideClick: false,
      buttonsStyling: false,
      reverseButtons: true,
      position: 'top',
      padding: 0,
      customClass: { container: 'sw-leave-container', cancelButton: 'btn btn-warning border col-auto mr-auto', confirmButton: 'col-auto btn btn-info' }
    })
    .then((result) => {
        if (result.value){
          this.companyService.deleteMenuItem(item).subscribe(data => {
            if(data.success) {
              this._notificationSvc.success('Hola '+this.user.companyName+'', data.msg, 6000);
              this.getMyListMenu();
            } else {
              this._notificationSvc.warning('Hola '+this.user.companyName+'', data.msg, 6000);
            }
          },
          error => {
            $('#newMenuModal').modal('hide');
            this._notificationSvc.warning('Hola '+this.user.companyName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
          });
        }
    });
  }
  
  close(){
    this.showEditMenu = false;
    $('#newMenuModal').modal('hide');
  }
  //Track order ticket

  stepTrackOrder(step: number){
    this.id = step;
  }

  newMenuSubmit() {
    this.submitted = true;
    this.loading = true;
    // stop here if form is invalid
    if (this.newMenuForm.invalid) {
        return;
    }
    var newMenu = {
      foodName: this.f.foodName.value,
      description: this.f.description.value,
      cost: this.f.cost.value,
      idCompany: this.user.id
    }

    this.companyService.registerNewMenu(newMenu,this.file).subscribe(data => {
      if(data.success) {
        this.loading = false;
        $('#newMenuModal').modal('hide');
        this._notificationSvc.success('Hola '+this.user.companyName+'', data.msg, 6000);
        this.getMyListMenu();
      } else {
        this.loading = false;
        $('#newMenuModal').modal('hide');
        this._notificationSvc.warning('Hola '+this.user.companyName+'', data.msg, 6000);
      }
    },
    error => {
      $('#newMenuModal').modal('hide');
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.user.companyName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  ngOnDestroy() {
    if(this.mediaSubscription){
      this.mediaSubscription.unsubscribe();
    }
  }

  processFile(event: HtmlInputEvent): void {
    if(event.target.files && event.target.files[0]){
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.photoSelected = reader.result;
      reader.readAsDataURL(this.file);
    }
  }
}

