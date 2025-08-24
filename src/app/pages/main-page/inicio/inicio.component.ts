import { Component, OnInit } from '@angular/core';
import { functions } from 'src/app/helpers/functions';
import { AlmacenesService } from 'src/app/services/almacenes.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  horaActual: string;
  fechaActual!: Date;
  alamcenesStorage = JSON.parse(localStorage.getItem('almacenes')!);


  constructor(
        private almacenesService: AlmacenesService,
    
  ) {
    this.horaActual = this.obtenerHoraActual();
  }

  async ngOnInit(): Promise<void> {

    /*=======================
    Cargar listado de  almacen
    ======================*/
    await functions.verificacionAlmacenes(this.almacenesService);

    this.actualizarFecha();

    setInterval(() => {
      this.horaActual = this.obtenerHoraActual();

    }, 1000);
  }

  private obtenerHoraActual(): string {
    const ahora = new Date();
    this.fechaActual = new Date;

    return ahora.toLocaleTimeString();
  }

  private actualizarFecha(): void {
  }

}
