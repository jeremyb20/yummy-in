import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthServices } from '../common/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loginForm: FormGroup;
  email: string;
  password: string;
  submitted = false;
  loading: boolean = false;
  hideMsg: boolean = false; 
  ShowMsg: string;
  timeSeconds: number =  3000;
  constructor(
    private authService: AuthServices,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit() {
    this.loginForm =  this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const user = {
      email: this.f.email.value,
      password: this.f.password.value
    }

    this.authService.authenticateUser(user).subscribe(data => {
        if(data.success) {
          switch (data.user.userState) {
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
          this.authService.storeUserData(data.token, data.user);
        } else {
          this.hideMsg = true;
          this.ShowMsg = data.msg;
          setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
        }
    });
  }

}
