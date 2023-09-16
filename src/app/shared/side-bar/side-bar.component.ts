import { Component } from '@angular/core';
import { ApiauthService } from 'src/app/services/apiauth.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {

constructor( private apiauthService: ApiauthService){

}

  logout(){

    this.apiauthService.logout();

}

}
