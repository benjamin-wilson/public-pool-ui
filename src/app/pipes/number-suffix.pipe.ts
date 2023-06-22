import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberSuffix',
  pure: true
})
export class NumberSuffixPipe implements PipeTransform {

  transform(value: number): string {

    const suffixes = ['', 'k', 'M', 'B', 'T', 'P', 'E'];

    if (value === 0) {
      return '0';
    }

    const power = Math.floor(Math.log10(value) / 3);
    const scaledValue = value / Math.pow(1000, power);
    const suffix = suffixes[power];

    return scaledValue.toFixed(1) + suffix;
  }

}
