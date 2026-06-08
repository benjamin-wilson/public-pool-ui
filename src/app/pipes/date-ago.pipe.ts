import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true
})
export class DateAgoPipe implements PipeTransform {

  transform(value: any, withSuffix = false): any {
    if (value) {
      const diffSeconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      const seconds = Math.abs(diffSeconds);
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
        const number = (seconds / intervals[i]).toFixed(1);
        counter = Math.floor(seconds / intervals[i]);

        if (counter > 0) {
          const duration = number + ' ' + i + 's';
          if (!withSuffix) {
            return duration;
          }

          return diffSeconds >= 0 ? duration + ' ago' : 'in ' + duration;
        }
      }
    }
    return value;
  }

}
