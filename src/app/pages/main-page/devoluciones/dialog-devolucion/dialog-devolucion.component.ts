import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { functions } from 'src/app/helpers/functions';
import { IdetalleVenta } from 'src/app/interface/idetalle-venta';
import { Iventa } from 'src/app/interface/iventa';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-dialog-devolucion',
  templateUrl: './dialog-devolucion.component.html',
  styleUrls: ['./dialog-devolucion.component.css']
})
export class DialogDevolucionComponent implements OnInit {








  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;

  loadData = false;
  lstfactura: Iventa[] = [];
  lstDetalle: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogDevolucionComponent>,
    public ventasService: VentasService
  ) { }

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas() {

    this.ventasService.getData().subscribe(
      resp => {
        this.lstfactura = resp.data;
    })
  }




  selecionarDetalle(a : any){

  }

  cargarDetalle( id: any){

    this.ventasService.getItem(id).subscribe(
      resp => {
        this.lstDetalle = resp.data.detalles

      }
    )

  }

}
