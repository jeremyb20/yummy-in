import { Component, ElementRef, NgZone, OnInit, ViewChild,Input } from '@angular/core';
import { Router } from '@angular/router';
import { MustMatch } from '../../common/helpers/must-match.validator';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthServices } from 'src/app/common/services/auth.service';
import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {
  file : File;
  photoSelected: String | ArrayBuffer;
  loading: boolean = false;
  registerForm: FormGroup;
  user: SocialUser;
  submitted = false;
  hideMsg: boolean = false; 
  ShowMsg: string;
  timeSeconds: number =  6000;

  constructor(
    private authServices: AuthServices,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: SocialAuthService
   // private flashMessage: FlashMessagesService
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      phone: ['', [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
   }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.loading = true;
      this.user = user;
      const Newuser = {
        name: this.user.name,
        email: this.user.email,
        username: this.user.firstName,
        userState: 1,
        password: 'qwer1234',
        authPhoto: this.user.provider == 'FACEBOOK'? this.user.response.picture.data.url: this.user.photoUrl
      }
      this.authServices.registerUser(Newuser,this.file).subscribe(data => {
        if(data.success) {
          const user = {
            email: this.user.email,
            password: Newuser.password
          }

          this.authServices.authenticateUser(user).subscribe(data => {
            if(data.success) {
              this.loading = false;
              switch (Newuser.userState) {
                case 0:
                  this.router.navigate(['/admin']);
                  break;
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
              this.authServices.storeUserData(data.token, data.user);
            }
        });
        } else {
          this.router.navigate(['/register-user']);
        }
      });
    });
  }

  siginSocialMedia() {
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  processFile(event: HtmlInputEvent): void {

    if(event.target.files && event.target.files[0]){
      this.file = <File>event.target.files[0];

      const reader = new FileReader();

      reader.onload = e => this.photoSelected = reader.result;
      reader.readAsDataURL(this.file);
    }
  }

  onRegisterSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }
    this.loading = true;
    var newUser = {
      name: this.f.name.value,
      username: this.f.username.value,
      phone: this.f.phone.value,
      email: this.f.email.value,
      password: this.f.password.value,
      acceptTerms: this.f.acceptTerms.value,
      userState: 1
    }

    this.authServices.registerUser(newUser,this.file).subscribe(data => {
      if(data.success) {
        this.loading = false;
        Swal.fire({
          title: 'Registro exitoso' + newUser.username+'' ,
          html: "Su registro ha sido authenticado correctamente. Haz click en ok para iniciar sesion",
          showCancelButton: false,
          allowEscapeKey: false,
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          buttonsStyling: false,
          reverseButtons: true,
          position: 'top',
          customClass: { confirmButton: 'col-auto btn btn-info m-3' }
        })
        .then((result) => {
            if (result.value){
              this.router.navigate(['/home']); 
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


  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x => console.log());
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(x => console.log());
  }


  signOut(): void {
    this.authService.signOut();
  }

}
