import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  horaActual: string;
  fechaActual!: Date;

  constructor() {
    this.horaActual = this.obtenerHoraActual();
  }

  ngOnInit(): void {
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
