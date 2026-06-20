import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import { HashSuffixPipe } from '../../pipes/hash-suffix.pipe';
import { WorkerService } from '../../services/worker.service';
import { AverageTimeToBlockPipe } from 'src/app/pipes/average-time-to-block.pipe';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.scss']
})
export class WorkerComponent {

  public workerInfo$: Observable<any>;

  public chartData$: Observable<any>;

  public chartOptions: any;

  public networkInfo$: Observable<any>;
  private networkInfo:any;


  constructor(
    private workerService: WorkerService, 
    private route: ActivatedRoute,
    private appService: AppService
  ) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const primaryColor = documentStyle.getPropertyValue('--primary-color');
    const soloColor = documentStyle.getPropertyValue('--yellow-600') || '#d97706';

    this.workerInfo$ = this.workerService.getWorkerInfo(this.route.snapshot.params['address'], this.route.snapshot.params['workerName'], this.route.snapshot.params['workerId']).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.networkInfo$ = this.appService.getNetworkInfo().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.chartData$ = combineLatest([ this.workerInfo$, this.networkInfo$]).pipe(
      map(([workerInfo, networkInfo]) => {

        this.networkInfo = networkInfo;
        const chartData = workerInfo.chartDataByPayoutMode ?? workerInfo.chartData;
        const datasets = this.toPayoutModeDatasets(chartData, workerInfo.name, {
          pplns: {
            label: `${workerInfo.name} PPLNS`,
            borderColor: primaryColor,
            backgroundColor: (context: any) => this.getChartGradient(context, primaryColor)
          },
          solo: {
            label: `${workerInfo.name} Solo`,
            borderColor: soloColor,
            backgroundColor: (context: any) => this.getChartGradient(context, soloColor)
          }
        });

        return {
          labels: chartData.map((d: any) => d.label),
          datasets
        }
      })
    );



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
            unit: 'day'
          },
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        yPplns: {
          position: 'left',
          title: {
            display: true,
            text: 'PPLNS',
            color: primaryColor
          },
          ticks: {
            color: primaryColor,
            callback: (value: number) => {
              return HashSuffixPipe.transform(value);
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          },
          beginAtZero: true
        },
        ySolo: {
          position: 'right',
          title: {
            display: true,
            text: 'Solo',
            color: soloColor
          },
          ticks: {
            color: soloColor,
            callback: (value: number) => {
              return HashSuffixPipe.transform(value);
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
            drawOnChartArea: false
          },
          beginAtZero: true
        }
      }
    };
  }


  private toChartPoint(point: any) {
    return {
      x: point.label,
      y: Number(point.data),
      creditedWork: point.shares,
      payoutMode: point.payoutMode
    };
  }

  private toPayoutModeDatasets(chartData: any[], fallbackLabel: string, modes: Record<string, { label: string; borderColor: string; backgroundColor: any; }>) {
    if (chartData.some(point => point.payoutMode != null)) {
      return Object.entries(modes)
        .map(([mode, config]) => {
          const rows = chartData.filter(point => point.payoutMode === mode);

          return {
            label: config.label,
            data: rows.map((d: any) => this.toChartPoint(d)),
            yAxisID: mode === 'solo' ? 'ySolo' : 'yPplns',
            fill: true,
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
            tension: .4,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2
          };
        })
        .filter(dataset => dataset.data.length > 0);
    }

    return [{
      label: fallbackLabel,
      data: chartData.map((d: any) => this.toChartPoint(d)),
      yAxisID: 'yPplns',
      fill: true,
      backgroundColor: modes['pplns'].backgroundColor,
      borderColor: modes['pplns'].borderColor,
      tension: .4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2
    }];
  }

  public formatPayoutMode(mode: string | null | undefined): string {
    return mode === 'pplns' ? 'PPLNS' : 'Solo';
  }

  public getPayoutModeClass(mode: string | null | undefined): string {
    return mode === 'pplns' ? 'mode-badge mode-badge-pplns' : 'mode-badge mode-badge-solo';
  }

  private getTooltipLabel(context: any) {
    return `${context.dataset.label}: ${HashSuffixPipe.transform(context.parsed.y)}`;
  }

  private getTooltipDetails(context: any) {
    const raw = context.raw || {};
    const lines = [];
    if (raw.creditedWork !== undefined) {
      lines.push(`Credited work: ${Number(raw.creditedWork).toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
    }

    if (this.networkInfo?.difficulty && context.parsed.y > 0) {
      lines.push(`Average time to block: ${AverageTimeToBlockPipe.transform(context.parsed.y, this.networkInfo.difficulty)}`);
    }

    return lines;
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
