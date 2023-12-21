import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cargo'
})
export class CargoPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case "1":
        return 'Administrador';
      case "2":
        return 'Empleado';
        case "3":
          return 'Distribuidor';
      default:
        return 'Desconocido';
    }
  }

}
