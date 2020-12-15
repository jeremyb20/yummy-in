import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginCompanyComponent } from './login/login-company/login-company.component';
import { LoginDriverComponent } from './login/login-driver/login-driver.component';
import { RegisterUserComponent } from './register/register-user/register-user.component';
import { RegisterCompanyComponent } from './register/register-company/register-company.component';
import { RegisterDriverComponent } from './register/register-driver/register-driver.component';
import { ForgotCompanyComponent } from './forgot/forgot-company/forgot-company.component';
import { ForgotUserComponent } from './forgot/forgot-user/forgot-user.component';
import { ForgotDriverComponent } from './forgot/forgot-driver/forgot-driver.component';
import { ResetCompanyComponent } from './reset/reset-company/reset-company.component';
import { ResetUserComponent } from './reset/reset-user/reset-user.component';
import { ResetDriverComponent } from './reset/reset-driver/reset-driver.component';

import { NotFoundComponent } from './not-found/not-found.component';
import { AdminGuard } from  './common/admin/admin.guard';

import { DashboardUserComponent } from './dashboard/dashboard-user/dashboard-user.component';
import { DashboardCompanyComponent } from './dashboard/dashboard-company/dashboard-company.component';
import { DashboardDriverComponent } from './dashboard/dashboard-driver/dashboard-driver.component';
import { ProfileUserComponent } from './profile/profile-user/profile-user.component';
import { ProfileCompanyComponent } from './profile/profile-company/profile-company.component';
import { ProfileDriverComponent } from './profile/profile-driver/profile-driver.component';
import { AdminMasterComponent } from './admin-master/admin-master.component';


const routes: Routes = [
  { 
      path: '', 
      component: LoginLayoutComponent, 
      children: [
          { path: '', redirectTo: 'home',  pathMatch: 'full' }, 
          { path: 'home', component: HomeComponent },
          { path: 'login-company', component: LoginCompanyComponent },
          { path: 'login-driver', component: LoginDriverComponent },
          { path: 'register-user', component: RegisterUserComponent },
          { path: 'register-company', component: RegisterCompanyComponent },
          { path: 'register-driver', component: RegisterDriverComponent },
          { path: 'forgot-company', component: ForgotCompanyComponent },
          { path: 'forgot-user', component: ForgotUserComponent },
          { path: 'forgot-driver', component: ForgotDriverComponent },
          { path: 'reset-company/:token', component: ResetCompanyComponent },
          { path: 'reset-user/:token', component: ResetUserComponent },
          { path: 'reset-driver/:token', component: ResetDriverComponent },
          // { path: 'maintenance', component: MaintenanceComponent },
      ]
  },
  { 
      path: '',
      component: MainLayoutComponent, 
      children: [    
        { path: 'admin', component: AdminMasterComponent },        
        { path: 'dashboard-user', component: DashboardUserComponent,canActivate: [AdminGuard] },
        { path: 'dashboard-company', component: DashboardCompanyComponent,canActivate: [AdminGuard] },
        { path: 'dashboard-driver', component: DashboardDriverComponent,canActivate: [AdminGuard] },
      
        { path: 'profile-user', component: ProfileUserComponent ,canActivate: [AdminGuard]},
        { path: 'profile-company', component: ProfileCompanyComponent ,canActivate: [AdminGuard]},
        { path: 'profile-driver', component: ProfileDriverComponent ,canActivate: [AdminGuard]},
        { path: '404', component: NotFoundComponent},
        { path: '**', redirectTo: '/404' }

      ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
