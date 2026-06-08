import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import { HashSuffixPipe } from '../../pipes/hash-suffix.pipe';
import { AppService } from '../../services/app.service';
import { AppConfigService } from '../../services/app-config.service';
import { bitcoinAddressValidator } from '../../validators/bitcoin-address.validator';
import { AverageTimeToBlockPipe } from 'src/app/pipes/average-time-to-block.pipe';


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
  public sv2$: Observable<any>;
  public accounting$: Observable<any>;

  public chartOptions: any;

  public stratumURL = '';
  public secureStratumURL = '';

  private info$: Observable<any>;

  private networkInfo: any;

  constructor(private appService: AppService, private appConfig: AppConfigService, private cdr: ChangeDetectorRef) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.info$ = this.appService.getInfo().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.stratumURL = this.appConfig.stratumUrl;

    if (environment.SECURE_STRATUM_URL.length > 1) {
      this.secureStratumURL = environment.SECURE_STRATUM_URL;
    } else {
      this.secureStratumURL = window.location.hostname + ':4333';
    }

    this.blockData$ = this.info$.pipe(map(info => info.blockData));
    this.userAgents$ = this.info$.pipe(map(info => info.userAgents));
    this.highScores$ = this.info$.pipe(map(info => info.highScores));
    this.sv2$ = this.info$.pipe(map(info => info.sv2));
    this.uptime$ = this.info$.pipe(map(info => info.uptime))
    this.accounting$ = this.appService.getAccounting().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.chartData$ = combineLatest([this.appService.getInfoChart(), this.appService.getNetworkInfo()]).pipe(
      map(([chartData, networkInfo]) => {
        this.networkInfo = networkInfo;
        return {

          labels: chartData.map((d: any) => d.label),
          datasets: [
            {
              label: 'Public-Pool Hashrate',
              data: chartData.map((d: any) => this.toChartPoint(d)),
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

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => this.getTooltipLabel(context),
            afterLabel: (context: any) => this.getTooltipDetails(context)
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day', // Set the unit to 'minute'
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
            callback: (value: number) => {
              return HashSuffixPipe.transform(value);
            }
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

  private toChartPoint(point: any) {
    return {
      x: point.label,
      y: Number(point.data),
      acceptedCount: point.acceptedCount,
      shares: point.shares
    };
  }

  private getTooltipLabel(context: any) {
    return `${context.dataset.label}: ${HashSuffixPipe.transform(context.parsed.y)}`;
  }

  private getTooltipDetails(context: any) {
    const raw = context.raw || {};
    const lines = [];

    if (raw.acceptedCount !== undefined) {
      lines.push(`Accepted shares: ${Number(raw.acceptedCount).toLocaleString()}`);
    }

    if (raw.shares !== undefined) {
      lines.push(`Credited difficulty: ${Number(raw.shares).toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
    }

    if (this.networkInfo?.difficulty && context.parsed.y > 0) {
      lines.push(`Average time to block: ${AverageTimeToBlockPipe.transform(context.parsed.y, this.networkInfo.difficulty)}`);
    }

    return lines;
  }
}
