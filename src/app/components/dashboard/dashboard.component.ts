import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import { HashSuffixPipe } from '../../pipes/hash-suffix.pipe';
import { AppService } from '../../services/app.service';
import { ClientService } from '../../services/client.service';
import { AverageTimeToBlockPipe } from 'src/app/pipes/average-time-to-block.pipe';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

  public address: string;

  public clientInfo$: Observable<any>;
  public chartData$: Observable<any>;

  public chartOptions: any;

  public networkInfo$: Observable<any>;
  private networkInfo:any;

  @ViewChild('dataTable') dataTable!: Table;

  public expandedRows$: Observable<any>;



  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private appService: AppService
  ) {

    this.networkInfo$ = this.appService.getNetworkInfo().pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.address = this.route.snapshot.params['address'];
    this.clientInfo$ = this.clientService.getClientInfo(this.address).pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.expandedRows$ = this.clientInfo$.pipe(map((info: any) => {

      return info.workers.reduce((pre: any, cur: any) => { pre[cur.name] = true; return pre; }, {});

    }));

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');


    this.chartData$ = combineLatest([
      this.clientService.getClientInfoChart(this.address),
      this.networkInfo$
    ]).pipe(
      map(([chartData, networkInfo]) => {

        this.networkInfo = networkInfo;
        const GROUP_SIZE = 6;
        const primaryColor = documentStyle.getPropertyValue('--primary-color');


        let hourlyData = [];

        for (let i = GROUP_SIZE - 1; i < chartData.length; i += GROUP_SIZE) {
          let sum = 0;
          let acceptedCount = 0;
          let shares = 0;
          for (let j = GROUP_SIZE - 1; j >= 0; j--) {
            const point = chartData[i - j];
            sum += Number(point.data);
            acceptedCount += Number(point.acceptedCount ?? 0);
            shares += Number(point.shares ?? 0);
          }
          sum = sum / GROUP_SIZE;
          hourlyData.push({ y: sum, x: chartData[i].label, acceptedCount, shares });
        }


        const data = chartData.map((d: any) => this.toChartPoint(d));

        return {
          labels: chartData.map((d: any) => d.label),
          datasets: [
            {
              type: 'line',
              label: '1 Hour Average',
              data: hourlyData,
              fill: false,
              backgroundColor: documentStyle.getPropertyValue('--yellow-600'),
              borderColor: documentStyle.getPropertyValue('--yellow-600'),
              tension: .4,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2
            },
            {
              type: 'line',
              label: '10 Minute',
              data: data,
              fill: true,
              backgroundColor: (context: any) => this.getChartGradient(context, primaryColor),
              borderColor: primaryColor,
              tension: .4,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2
            },

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



  ngAfterViewInit() {

  }

  public getSessionCount(name: string, workers: any[]) {
    const workersByName = workers.filter(w => w.name == name);
    return workersByName.length;
  }

  public getTotalHashRate(name: string, workers: any[]) {
    const workersByName = workers.filter(w => w.name == name);
    const sum = workersByName.reduce((pre, cur, idx, arr) => {
      return pre += Math.floor(cur.hashRate);
    }, 0);
    return Math.floor(sum);
  }

  public getBestDifficulty(name: string, workers: any[]) {
    const workersByName = workers.filter(w => w.name == name);
    const best = workersByName.reduce((pre, cur, idx, arr) => {
      if (cur.bestDifficulty > pre) {
        return cur.bestDifficulty;
      }
      return pre;
    }, 0);

    return best;
  }

  public getTotalUptime(name: string, workers: any[]) {
    const now = new Date().getTime();
    const workersByName = workers.filter(w => w.name == name);
    const sum = workersByName.reduce((pre, cur, idx, arr) => {
      return pre += now - new Date(cur.startTime).getTime();
    }, 0);
    return new Date(now - sum);
  }

  private toChartPoint(point: any) {
    return {
      y: Number(point.data),
      x: point.label,
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
