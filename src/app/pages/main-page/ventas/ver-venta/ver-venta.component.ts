import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-ver-venta',
  templateUrl: './ver-venta.component.html',
  styleUrls: ['./ver-venta.component.css']
})
export class VerVentaComponent implements OnInit {

  
  /*===========================================
  Variables  para guardar la factura
  ===========================================*/
  fecha: Date = new Date();
  numeroFactura = 0;
  subtotal = 0;
  descuentoTotal = 0;
  porcentajeIva = 12;
  valorIva = 0;
  total = 0;
  estadoFac = 0;


  constructor(private activatedRoute:ActivatedRoute,
              private ventasService:VentasService
    ){}

  ngOnInit(): void {
    
    this.activatedRoute.params.subscribe((params) =>{
      //params["id"]
      console.log("id", params["id"]);
      this.numeroFactura = params["id"]
      this.ventasService.getItem(params["id"]).subscribe(
        resp => {
          console.log("resp: ", resp);

        }
      )

    })
  }

}
