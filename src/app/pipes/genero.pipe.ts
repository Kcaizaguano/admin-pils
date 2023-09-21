import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genero'
})
export class GeneroPipe implements PipeTransform {

  transform(value: string): string {
    switch (value.toUpperCase()) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Femenino';
      case 'NB':
        return 'No Binario';
      default:
        return 'Desconocido';
    }
  }
}
