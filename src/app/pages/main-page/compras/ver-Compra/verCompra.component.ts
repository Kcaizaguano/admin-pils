import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { Iproducto } from 'src/app/interface/iproducto';
import { ComprasService } from 'src/app/services/compras.service';
import { ProductosService } from 'src/app/services/productos.service';


import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IdetalleCompra } from 'src/app/interface/idetalle-compra';

@Component({
  selector: 'app-verCompra',
  templateUrl: './verCompra.component.html',
  styleUrls: ['./verCompra.component.css']
})
export class VerCompraComponent implements OnInit {


  /*===========================================
  Variables  para  la factura
  ===========================================*/
  fecha: Date = new Date();
  numeroFactura = 0;
  total = 0;
  numeroOrde ="";
  proveedor="";
  descripcion="";

  /*===========================================
  Variables  para detalle factura
  ===========================================*/
  detalle: any[] = [];
  almacenesListado: Ialmacen[] = [];
  productosListado: Iproducto[] = [];



  constructor(private activatedRoute: ActivatedRoute,
    private productosService: ProductosService,
    private comprasService:ComprasService
  ) { }

  ngOnInit(): void {


    this.cargarListado();
    setTimeout(() => {

      this.activatedRoute.params.subscribe((params) => {
        this.numeroFactura = params["id"]
        this.cargarCompra( params["id"])

      })
    }, 500);
  }

  /*===========================================
  Función para actualizar una compra
  ===========================================*/
  cargarCompra(id: string) {
    this.comprasService.getItem(id).subscribe(
      resp => {
        this.numeroFactura = resp.data.comId;
        this.fecha = resp.data.comFecha;
        this.numeroOrde=  resp.data.comNumOrden;
        this.proveedor= resp.data.nombreProveedor;
        this.descripcion= resp.data.comDescripcion;
        this.total = resp.data.comTotal;
        resp.data.detalles.forEach((element: any) => {
          const detalle: IdetalleCompra = ({
            detId: element.detId,
            detIdProducto: element.detIdProducto,
            detPreCompra: element.detPreCompra,
            detPreVenta: element.detPreVenta,
            detCantidad: element.detCantidad,
            detTotal: element.detTotal,
            detIdCompra: element.detIdCompra,
            nombreProducto: element.nombreProducto,
            ubicacion:this.codPils(element.detIdProducto)

          } as IdetalleCompra)

          this.detalle.push(detalle);
        });


      }
    )
  }


  cargarListado() {

    this.productosService.getData().subscribe(
      resp => {
        this.productosListado = resp.data;
      }
    )


  }



  /*===========================================
Función para cargar variables no recibidas
===========================================*/
  codPils(id: number) { return this.productosListado.find(p => p.proId === id)?.proCodPils; }



  generarPdf(){
    
    const element = document.getElementById('pdf');
    const fileName = 'Pils Autorepuetos ' + this.numeroFactura; 
    html2canvas(element!).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      //pdf.save(fileName + '.pdf');
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      //window.open(url, '_blank');

      const newWindow = window.open(url);
      
      
    });

  }
}
