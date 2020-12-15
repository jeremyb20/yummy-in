import { Component, ElementRef, NgZone, OnInit, ViewChild,Input } from '@angular/core';
import { Router } from '@angular/router';
import { MustMatch } from '../../common/helpers/must-match.validator';
import { MapsAPILoader } from '@agm/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CompanyService } from 'src/app/common/services/company.service';

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}


@Component({
  selector: 'app-register-company',
  templateUrl: './register-company.component.html',
  styleUrls: ['./register-company.component.scss']
})
export class RegisterCompanyComponent implements OnInit {
  @Input() phone;
  proper = false;
  public searchControl: FormControl;
  registerForm: FormGroup;
  submitted = false;
  zoom: number = 4;
  lat: number = 9.93040049002793;
  lng: number = -84.09062837772197;
  markers: marker[] = [];
  showInfo: boolean = true;
  hideMsg: boolean = false; 
  ShowMsg: string;
  timeSeconds: number =  6000;
  file : File;
  photoSelected: String | ArrayBuffer;
  bussinesType = [
    {Id: 1, name: 'Restaurante'},
    {Id: 2, name: 'Tienda de conveniencia'},
    {Id: 3, name: 'Tienda de comestibles'},
    {Id: 4, name: 'Tienda de licor'}
  ];

  
  constructor(private formBuilder: FormBuilder,private mapsAPILoader: MapsAPILoader,private ngZone: NgZone, private companyService: CompanyService, private router: Router ) {
    this.setCurrentPosition();
   }

  ngOnInit() {
      this.registerForm = this.formBuilder.group({
          companyName: ['', Validators.required],
          bussinesSelected: ['', Validators.required],
          phone: ['', [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', Validators.required],
          acceptTerms: [false, Validators.requiredTrue]
      }, {
        validator: MustMatch('password', 'confirmPassword')
      });
  }

  mapClicked($event: MouseEvent) {
    var event: any;
      event = $event
    this.showInfo = true;
    if (this.markers.length < 1) {
      this.markers.push({
        lat: event.coords.lat,
        lng: event.coords.lng,
        draggable: false,
        photo: 'https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg'
      });
    }
    
  }

  setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.zoom = 17;

        this.markers.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          draggable: false,
          photo: 'https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg'
        });
        this.showInfo = true;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  changePosition(mPosition: any){
    if (this.markers.length > 0) {
      this.markers.shift();
    }
    this.showInfo = false;
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  savePosition() {
    this.showInfo = false;
  }

  onSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      if (this.registerForm.invalid) {
          return;
      }
      var newCompany = {
        companyName: this.f.companyName.value,
        phone: this.f.phone.value,
        email: this.f.email.value,
        password: this.f.password.value,
        acceptTerms: this.f.acceptTerms.value,
        lat: this.markers[0].lat,
        lng: this.markers[0].lng,
        bussinesSelected: this.f.bussinesSelected.value,
        userState: 3
      }

      this.companyService.registerCompany(newCompany,this.file).subscribe(data => {
        if(data.success) {
          Swal.fire({
            title: 'Registro de la empresa ' + newCompany.companyName+'' ,
            html: "Su registro ha sido authenticado correctamente. Haz click en ok para iniciar sesion",
            showCancelButton: false,
            allowEscapeKey: false,
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            buttonsStyling: false,
            reverseButtons: true,
            position: 'top',
            padding: 0,
            customClass: { confirmButton: 'col-auto btn btn-info m-3' }
          })
          .then((result) => {
              if (result.value){
                this.router.navigate(['/login-company']); 
              }
                
          });
        } else {
          this.hideMsg = true;
          this.ShowMsg = data.msg;
          setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
        }
      },
      error => {
        this.hideMsg = true;
        this.ShowMsg = "Ocurrio un error favor contactar a soporte o al administrador del sitio";
        setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
      });
  }

  onReset() {
      this.submitted = false;
      this.registerForm.reset();
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
interface marker {
	lat: number;
	lng: number;
	label?: string;
  draggable: boolean;
  photo?: any;
}
