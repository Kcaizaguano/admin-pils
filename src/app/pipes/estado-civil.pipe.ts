import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoCivil'
})
export class EstadoCivilPipe implements PipeTransform {

  transform(value: string): string {
    switch (value.toUpperCase()) {
      case 'S':
        return 'Soltero';
      case 'C':
        return 'Casado';
      case 'D':
        return 'Divorciado';
      case 'V':
        return 'Viudo';
      case 'U':
          return 'Unión Libre';
      default:
        return 'Desconocido';
    }
  }

}
