import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { Iproducto } from 'src/app/interface/iproducto';
import { DocumentosService } from 'src/app/services/documentos.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {


constructor( private documentosService:DocumentosService,
  private productosService: ProductosService,
){

}
  /*========================================================
  variables globales para definir el inventario de repuestos
  ==========================================================*/
  repuestos = 0;
  loadRepuestos = false;

  /*========================================================
  variables globales para definir el inventario de ventas
  ==========================================================*/
  ventas = 0;
  loadVentas = false;

  /*========================================================
variables globales para definir el inventario de clientes
==========================================================*/
  clientes = 0;
  loadClientes = false;

  /*========================================================
variables globales para definir el inventario de empleados
==========================================================*/
  empleados = 0;
  loadEmpleados = false;

  /*========================================================
variables globales para definir el inventario de cotizaciones
==========================================================*/
  cotizaciones = 0;
  loadCotizaciones = false;

  /*================================
  variables para filtror
  =================================*/
  lstRepuestosMayoRotacion:any = [];
  
  almacenes: any = [];

  
  /*================================
  Rango de fechas
  =================================*/
  incioFecha = new Date(new Date().getFullYear(), 0, 1);//SE TRAE TODO LO DEL AÑO ACTUAL
  finFecha = new Date();


  cargarVentas(){

  }

  /***************************************
  Función para obtener el reporte de  pedidos
  ****************************************/
  pedidoRepuestos() {

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Repuestos a Pedir', 20, 20);
    this.productosService.getData().subscribe(
      res => {
        var pedido: any = [];
        res.data.forEach((element: Iproducto) => {
          if (element.proStockMinimo >= element.proStockTotal) {
            const data = [element.proCodPils,
                          element.proNumParte,
                          element.proStockTotal,
                          element.proPrecioCompra,
                          element.proPvpEfectivo
                      ];
            pedido.push(data);
          }
        });
        
        autoTable(doc, {
          head: [["Codigo", "Número Parte", "Stock Total", "Precio Compra", "Precio Venta"]],
          body: [...pedido], 
          startY: 30,
        });
        

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url);
        //doc.save('table.pdf');
        

      }
    )
  }


    /*******************************
  FUnción para repuestos de mayor rotacion
  ********************************/
repuestosMayorRotacion(){


  var mayor: any = [];
  this.lstRepuestosMayoRotacion.forEach((element : any) => {
    const data =[element.id,
                  element.nombre,
                  element.cantidadVendida,
                  element.precio
    ]

    mayor.push(data);
    
  });

    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Repuestos con Mayor Rotacion', 20, 20);

        autoTable(pdf, {
          head: [["Id", "Codigo Pils", "Cantidad Vendida", "Precio"]],
          body: [...mayor], 
          startY: 30,
        });
        

        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url);

}


repuestosMayorStock(){

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Repuestos con mayor Stock', 20, 20);
  this.productosService.getData().subscribe(
    res => {
      var pedido: any = [];
      res.data.forEach((element: Iproducto) => {
        var umbral_proporcion = 6.0 
        const proporcion_stock = element.proStockTotal / element.proStockMinimo;
        if ( proporcion_stock > umbral_proporcion ) {
          const data = [element.proCodPils,
                        element.proNumParte,
                        element.proStockTotal,
                        element.proStockMinimo,
                        element.proPrecioCompra,
                        element.proPvpEfectivo
                    ];
          pedido.push(data);
        }
      });
      
      autoTable(doc, {
        head: [["Codigo", "Número Parte", "Stock Total","Stock Minimo" ,"Precio Compra", "Precio Venta"]],
        body: [...pedido], 
        startY: 30,
      });
      

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url);
      //doc.save('table.pdf');
      

    }
  )
}

reporteGeneral(){

  this.productosService.getData().subscribe(
    resp => {

      let lista = Object.keys(resp.data).map(a => ({

        proId: resp.data[a].proId,
        proNumParte: resp.data[a].proNumParte,
        proNombre: resp.data[a].proNombre,
        proPrecioCompra: resp.data[a].proPrecioCompra,
        proPvpEfectivo: resp.data[a].proPvpEfectivo,
        proPvpTarjeta: resp.data[a].proPvpTarjeta,
        proDescripcion: resp.data[a].proDescripcion,
        proPresentacion: resp.data[a].proPresentacion,
        proUrlImagen: resp.data[a].proUrlImagen,
        proEstado: resp.data[a].proEstado,
        proStockTotal: resp.data[a].proStockTotal,
        proProvId: resp.data[a].proProvId,
        proStockMinimo: resp.data[a].proStockMinimo,
        proCodPils: resp.data[a].proCodPils,
        //proProveedor: this.proveedores.find(p => p.proId === resp.data[a].proProvId)?.proNombre,
        modelos: this.obtenerModeloID(resp.data[a].modelos),
        marcas: this.obtenerMarcaID(resp.data[a].marcas),
        almacen: this.obtenerAlmacenID(resp.data[a].almacen)

      } as Iproducto))

      lista =lista.sort((a: any, b : any) => a.proCodPils.localeCompare(b.proCodPils));
      
      var header =[
        {name: 'Cod. Pils', key: 'proCodPils'},
        {name: 'Numero Parte', key: 'proNumParte'},
        {name: 'Nombre', key: 'proNombre'},
        {name: 'Marcas', key: 'marcas'},
        {name: 'Modelos', key: 'modelos'},
        {name: 'Stock Total', key: 'proStockTotal'},
        {name: 'Alamcenes', key: 'almacen'},
        {name: 'Pre.Compra', key: 'proPrecioCompra'},
        {name: 'Pre. Efectivo', key: 'proPvpEfectivo'},
        {name: 'Pre. Tarjeta', key: 'proPvpTarjeta'},
        {name: 'Stock Mínimo', key: 'proStockMinimo'},
        {name: 'Presentacion', key: 'proPresentacion'},
        {name: 'Proveedor', key: 'proProvId'},
        {name: 'Descripción', key: 'proDescripcion'},
        {name: 'Imagen', key: 'proUrlImagen'},
        {name: 'Estado', key: 'proEstado'},
      ]

        this.documentosService.generarExcel( header, lista,'PrimerExcel.xlsx');
    }
  )
}



  /*===========================================
Función  cambio de id por nombre de marcas 
===========================================*/

obtenerMarcaID(lst: any) {
  let valores: string = "";
  lst.forEach((element: any) => {
    valores +=  element.marca + ", ";
  });

  return valores;

}

/*===========================================
Función  cambio de id por nombre de  modelos
===========================================*/

obtenerModeloID(lst: any) {
  let valores: string="";
  lst.forEach((element : any) => {
    valores += element.modelo + ", "
  });

  return valores;

}

obtenerAlmacenID(lst: any){
  let valores: string="";

  lst.forEach((element : any) => {
    valores += element.almacen +": "+element.stock+", "
    
  });

  return valores

}

}
