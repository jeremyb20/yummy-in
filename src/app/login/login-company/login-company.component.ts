import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserState } from 'src/app/common/constants/constants';
import { Router } from '@angular/router';
import { CompanyService } from 'src/app/common/services/company.service';

@Component({
  selector: 'app-login-company',
  templateUrl: './login-company.component.html',
  styleUrls: ['./login-company.component.scss']
})
export class LoginCompanyComponent implements OnInit {
  loginForm: FormGroup;
  email: string;
  password: string;
  submitted = false;
  loading: boolean = false;
  hideMsg: boolean = false; 
  ShowMsg: string;
  timeSeconds: number =  6000;
  UserState = UserState
  constructor(
    private companyService: CompanyService,
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
    const company = {
      email: this.f.email.value,
      password: this.f.password.value
    }

    this.companyService.authenticateCompany(company).subscribe(data => {
        if(data.success) {
          switch (data.company.userState) {
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
          this.companyService.storeUserData(data.token, data.company);
        } else {
          this.hideMsg = true;
          this.ShowMsg = data.msg;
          setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
        }
    });
  }

}
