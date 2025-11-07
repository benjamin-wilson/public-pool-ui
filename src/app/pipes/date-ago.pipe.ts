import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true
})
export class DateAgoPipe implements PipeTransform {

  transform(value: any, args: { hasSuffix?: boolean } = { hasSuffix: true }): any {
    if (value) {
      const seconds = Math.abs(Math.floor((+new Date() - +new Date(value)) / 1000));
      if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
        return 'Just now';
      const intervals: { [key: string]: number } = {
        'year': 31536000,
        'month': 2592000,
        'week': 604800,
        'day': 86400,
        'hour': 3600,
        'minute': 60,
        'second': 1
      };
      let counter;
      for (const i in intervals) {
        const number = Math.round(seconds / intervals[i]);
        counter = Math.floor(seconds / intervals[i]);

        if (counter > 0) return `${number} ${i}${number > 1 ? 's' : ''}${args?.hasSuffix ? ' ago' : ''}`;
      }
    }
    return value;
  }

}