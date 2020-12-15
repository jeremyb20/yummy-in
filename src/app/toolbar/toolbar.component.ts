import { Component, OnInit } from '@angular/core';
import { AuthServices } from '../common/services/auth.service';
import { MediaService, MediaResponse } from '../common/services/media.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CompanyService } from '../common/services/company.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  private mediaSubscription: Subscription;
  Media: MediaResponse;

  constructor(public authService: AuthServices, public companyService: CompanyService, private media: MediaService,private route: Router) { 
    this.mediaSubscription = this.media.subscribeMedia().subscribe(result => {
      this.Media = result;
    });
  }

  ngOnInit(): void {
  }

  logout() {
    this.authService.logout();
    this.route.navigate(['/home'])
  }

}
