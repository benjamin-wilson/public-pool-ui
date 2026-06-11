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
  public networkInfo$: Observable<any>;

  public chartOptions: any;
  public copiedLabel: string | null = null;

  public stratumURL = '';
  public secureStratumURL = '';

  private info$: Observable<any>;

  private networkInfo: any;
  private copiedTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private appService: AppService, private appConfig: AppConfigService, private cdr: ChangeDetectorRef) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.info$ = this.appService.getInfo().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.stratumURL = this.appConfig.stratumUrl;
    this.secureStratumURL = this.appConfig.secureStratumUrl;

    this.blockData$ = this.info$.pipe(map(info => info.blockData));
    this.userAgents$ = this.info$.pipe(map(info => info.userAgents));
    this.highScores$ = this.info$.pipe(map(info => info.highScores));
    this.sv2$ = this.info$.pipe(map(info => info.sv2));
    this.uptime$ = this.info$.pipe(map(info => info.uptime))
    this.accounting$ = this.appService.getAccounting().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );
    this.networkInfo$ = this.appService.getNetworkInfo().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.chartData$ = combineLatest([this.appService.getInfoChart(), this.networkInfo$]).pipe(
      map(([chartData, networkInfo]) => {
        this.networkInfo = networkInfo;
        const primaryColor = documentStyle.getPropertyValue('--primary-color');
        return {

          labels: chartData.map((d: any) => d.label),
          datasets: [
            {
              label: 'Public-Pool Hashrate',
              data: chartData.map((d: any) => this.toChartPoint(d)),
              fill: true,
              backgroundColor: (context: any) => this.getChartGradient(context, primaryColor),
              borderColor: primaryColor,
              tension: .4,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2
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

  public getNetworkDifficultyProgress(accounting: any): number {
    const percent = Number(accounting?.networkDifficultyPercent ?? 0);
    if (!Number.isFinite(percent) || percent <= 0) {
      return 0;
    }
    return Math.min(percent, 100);
  }

  public copyText(value: string, label: string) {
    const complete = () => {
      this.copiedLabel = label;
      if (this.copiedTimeout != null) {
        clearTimeout(this.copiedTimeout);
      }
      this.copiedTimeout = setTimeout(() => {
        this.copiedLabel = null;
        this.copiedTimeout = null;
      }, 1500);
    };

    if (window.navigator?.clipboard != null) {
      void window.navigator.clipboard.writeText(value).then(complete, () => this.copyTextFallback(value, complete));
      return;
    }

    this.copyTextFallback(value, complete);
  }

  private copyTextFallback(value: string, complete: () => void) {
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', 'true');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand('copy');
      complete();
    } finally {
      document.body.removeChild(input);
    }
  }

  private getChartGradient(context: any, color: string) {
    const chart = context.chart;
    const chartArea = chart.chartArea;

    if (chartArea == null) {
      return this.toRgba(color, 0.2);
    }

    const gradient = chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, this.toRgba(color, 0.32));
    gradient.addColorStop(0.65, this.toRgba(color, 0.09));
    gradient.addColorStop(1, this.toRgba(color, 0));
    return gradient;
  }

  private toRgba(color: string, alpha: number): string {
    const trimmed = color.trim();
    const hex = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex != null) {
      const value = hex[1].length === 3
        ? hex[1].split('').map(part => part + part).join('')
        : hex[1];
      const red = parseInt(value.slice(0, 2), 16);
      const green = parseInt(value.slice(2, 4), 16);
      const blue = parseInt(value.slice(4, 6), 16);
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    const rgb = trimmed.match(/^rgba?\(([^)]+)\)$/i);
    if (rgb != null) {
      const parts = rgb[1].split(',').map(part => part.trim()).slice(0, 3);
      return `rgba(${parts.join(', ')}, ${alpha})`;
    }

    return trimmed || `rgba(99, 102, 241, ${alpha})`;
  }
}
