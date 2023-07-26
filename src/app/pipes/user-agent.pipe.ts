import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userAgent'
})
export class UserAgentPipe implements PipeTransform {

  transform(value: string): string {
    const valueLowerCase = value.toLowerCase();
    if (valueLowerCase.includes('bosminer-plus-tuner')) {
      return 'Braiins OS';
    } else {
      return value;
    }
  }

}
