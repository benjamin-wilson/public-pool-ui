import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
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
  public userAgents$: Observable<any>;
  public highScores$: Observable<any>;
  public uptime$: Observable<string>;

  public chartOptions: any;

  public stratumURL = '';

  constructor(private appService: AppService) {

    const info$ = this.appService.getInfo().pipe(shareReplay({ refCount: true, bufferSize: 1 }));


    if (environment.STRATUM_URL.length > 1) {
      this.stratumURL = environment.STRATUM_URL;
    } else {
      this.stratumURL = window.location.hostname + ':3333';
    }

    this.blockData$ = info$.pipe(map(info => info.blockData));
    this.userAgents$ = info$.pipe(map(info => info.userAgents));
    this.highScores$ = info$.pipe(map(info => info.highScores));
    this.uptime$ = info$.pipe(map(info => info.uptime))

    this.chartData$ = this.appService.getInfoChart().pipe(
      map((chartData: any) => {
        return {

          labels: chartData.map((d: any) => d.label),
          datasets: [
            {
              label: 'Public-Pool Hashrate',
              data: chartData.map((d: any) => d.data),
              fill: false,
              backgroundColor: documentStyle.getPropertyValue('--primary-color'),
              borderColor: documentStyle.getPropertyValue('--primary-color'),
              tension: .4,
              pointRadius: 1,
              borderWidth: 1
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
      maintainAspectRatio: false,
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
          },
          type: 'logarithmic',
        }
      }
    };

  }
}
