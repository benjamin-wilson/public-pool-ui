import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hashSuffix'
})
export class HashSuffixPipe implements PipeTransform {

  private static _this = new HashSuffixPipe();

  public static transform(value: number): string {
    return this._this.transform(value);
  }

  public transform(value: number): string {

    if (value == null || value == 0) {
      return '0';
    }

    const suffixes = [' H/s', ' KH/s', ' MH/s', ' GH/s', ' TH/s', ' PH/s', ' EH/s'];

    const power = Math.floor(Math.log10(value) / 3);
    const scaledValue = value / Math.pow(1000, power);
    const suffix = suffixes[power];

    return scaledValue.toFixed(1) + suffix;
  }


}
