import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, shareReplay } from 'rxjs';

import { HashSuffixPipe } from '../../pipes/hash-suffix.pipe';
import { AppService } from '../../services/app.service';
import { bitcoinAddressValidator } from '../../validators/bitcoin-address.validator';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent {

  public address: FormControl;

  public chartData$: Observable<any>;
  public blockData$: Observable<any>;

  public chartOptions: any;

  constructor(private appService: AppService) {

    const info$ = this.appService.getInfo().pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    this.blockData$ = info$.pipe(map(info => info.blockData));
    this.chartData$ = info$.pipe(
      map((info: any) => {
        return {
          labels: info.chartData.map((d: any) => new Date(d.label)),
          datasets: [
            {
              label: 'Public-Pool Hashrate',
              data: info.chartData.map((d: any) => d.data),
              fill: false,
              backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
              borderColor: documentStyle.getPropertyValue('--bluegray-700'),
              tension: .4
            }
          ]
        }
      })
    );

    this.address = new FormControl(null, bitcoinAddressValidator());



    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');


    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour', // Set the unit to 'minute'
          },
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
            display: true
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: (value: number) => HashSuffixPipe.transform(value)
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

  }
}
