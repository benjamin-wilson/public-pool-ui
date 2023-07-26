import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberSuffix',
  pure: true
})
export class NumberSuffixPipe implements PipeTransform {

  transform(value: number): string {

    const suffixes = ['', 'k', 'M', 'B', 'T', 'P', 'E'];

    if (value == null || value < 0) {
      return '0';
    }

    let power = Math.floor(Math.log10(value) / 3);
    if (power < 0) {
      power = 0;
    }
    const scaledValue = value / Math.pow(1000, power);
    const suffix = suffixes[power];

    return scaledValue.toFixed(2) + suffix;
  }

}
