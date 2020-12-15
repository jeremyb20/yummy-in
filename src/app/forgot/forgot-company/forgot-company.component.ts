import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from 'src/app/common/services/company.service';
import { NotificationService } from 'src/app/common/services/notification.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-company',
  templateUrl: './forgot-company.component.html',
  styleUrls: ['./forgot-company.component.scss']
})
export class ForgotCompanyComponent implements OnInit {
  forgotCompanyForm: FormGroup;
  submitted = false;
  loading: boolean = false;
  hideMsg: boolean = false; 
  ShowMsg: string;
  timeSeconds: number = 8000;
  

  constructor(private formBuilder: FormBuilder, private companyService: CompanyService,private _notificationSvc: NotificationService, private router: Router) {}

    ngOnInit(){
      this.forgotCompanyForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]]
      });
    }

    get f() { return this.forgotCompanyForm.controls; }

    onForgotPasswordCompanySubmit(){
      this.submitted = true;
      // stop here if form is invalid
      if (this.forgotCompanyForm.invalid) {
          return;
      }
      this.loading = true;

      const user = {
        email: this.f.email.value
      }

      this.companyService.forgotPassword(user).subscribe(data => {
        if(data.success) {
          this.loading = false;
          Swal.fire({
            title: 'Correo enviado exitosamente' ,
            html: data.msg,
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
          this.loading = false;
          this.hideMsg = true;
          this.ShowMsg = data.msg;
          setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
        }
      },
      error => {
        this.loading = false;
        this._notificationSvc.warning('Hola', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
      });
    }  

}
