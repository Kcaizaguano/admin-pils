import { Component } from '@angular/core';
import { alerts } from 'src/app/helpers/alerts';
import { ApiauthService } from 'src/app/services/apiauth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {

  constructor( private apiauthService: ApiauthService){

  }

  logout() {
    alerts.confirmAlert("¿ Estás seguro que desea salir ?", "", "warning", "Si, salir").then(
      (result) => {
        if (result.isConfirmed) {
          this.apiauthService.logout();
        }
      }
    )

  }

}
