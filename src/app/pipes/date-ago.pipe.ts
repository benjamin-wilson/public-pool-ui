import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true
})
export class DateAgoPipe implements PipeTransform {

  transform(value: any, args?: any): any {
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
        const number = (seconds / intervals[i]).toFixed(1);
        counter = Math.floor(seconds / intervals[i]);
        
        if (counter > 0)
          return number + ' ' + i + 's'; // plural (2 days ago)
          // if (counter === 1) {
          //   return number + ' ' + i + ''; // singular (1 day ago)
          // } else {
          //   return number + ' ' + i + 's'; // plural (2 days ago)
          // }
      }
    }
    return value;
  }

}