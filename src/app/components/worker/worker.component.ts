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

    this.workerInfo$ = this.workerService.getWorkerInfo(this.route.snapshot.params['address'], this.route.snapshot.params['workerName'], this.route.snapshot.params['workerId']).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.networkInfo$ = this.appService.getNetworkInfo().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.chartData$ = combineLatest([ this.workerInfo$, this.networkInfo$]).pipe(
      map(([workerInfo, networkInfo]) => {

        this.networkInfo = networkInfo;
        const primaryColor = documentStyle.getPropertyValue('--primary-color');

        return {
          labels: workerInfo.chartData.map((d: any) => d.label),
          datasets: [
            {
              label: workerInfo.name,
              data: workerInfo.chartData.map((d: any) => this.toChartPoint(d)),
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
          }
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
