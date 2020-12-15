import { Component, OnInit } from '@angular/core';
declare var $ : any;

@Component({
  selector: 'app-register-driver',
  templateUrl: './register-driver.component.html',
  styleUrls: ['./register-driver.component.scss']
})
export class RegisterDriverComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(function () {
      $('#datetimepicker1').datetimepicker();
    });
  }
}
