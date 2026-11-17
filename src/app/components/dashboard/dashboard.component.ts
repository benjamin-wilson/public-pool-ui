import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { combineLatest, forkJoin, map, Observable, shareReplay } from 'rxjs';

import { HashSuffixPipe } from '../../pipes/hash-suffix.pipe';
import { AppService } from '../../services/app.service';
import { ClientService } from '../../services/client.service';
import { AverageTimeToBlockPipe } from 'src/app/pipes/average-time-to-block.pipe';
import {
  chanceWithin, expectedSeconds, formatDuration, formatOneIn, formatPercent,
  SECONDS_PER_BLOCK, SECONDS_PER_DAY, SECONDS_PER_MONTH, SECONDS_PER_YEAR
} from '../../utils/block-odds';

// Odds use the average of the last hour of chart points; a single 10-minute
// reading swings too much to base odds on.
const CHART_POINT_MINUTES = 10;
const ODDS_AVERAGE_POINTS = 60 / CHART_POINT_MINUTES;

const CHAIN_NAMES: { [chain: string]: string } = {
  main: 'mainnet',
  test: 'testnet3',
  testnet4: 'testnet4',
  signet: 'signet',
  regtest: 'regtest'
};



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

  public address: string;

  public clientInfo$: Observable<any>;
  public clientInfoByPayoutMode$: Observable<{ pplns: any; solo: any; }>;
  public chartData$: Observable<any>;
  public soloOdds$: Observable<any>;

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
    this.clientInfoByPayoutMode$ = forkJoin({
      pplns: this.clientService.getClientInfo(this.address, 'pplns'),
      solo: this.clientService.getClientInfo(this.address, 'solo')
    }).pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.expandedRows$ = this.clientInfo$.pipe(map((info: any) => {

      return info.workers.reduce((pre: any, cur: any) => { pre[cur.name] = true; return pre; }, {});

    }));

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const primaryColor = documentStyle.getPropertyValue('--primary-color');
    const soloColor = documentStyle.getPropertyValue('--yellow-600') || '#d97706';


    const clientChart$ = this.clientService.getClientInfoChartByPayoutMode(this.address, 'all').pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.soloOdds$ = combineLatest([clientChart$, this.clientInfo$, this.networkInfo$]).pipe(
      map(([chartData, clientInfo, networkInfo]) => this.calculateSoloOdds(chartData, clientInfo, networkInfo))
    );

    this.chartData$ = combineLatest([
      clientChart$,
      this.networkInfo$
    ]).pipe(
      map(([chartData, networkInfo]) => {

        this.networkInfo = networkInfo;
        const datasets = this.toPayoutModeDatasets(chartData, {
          pplns: {
            label: 'PPLNS 10 Minute',
            borderColor: primaryColor,
            backgroundColor: (context: any) => this.getChartGradient(context, primaryColor)
          },
          solo: {
            label: 'Solo 10 Minute',
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



  ngAfterViewInit() {

  }

  // Only solo work can find a block for this address; PPLNS work is paid
  // from the pool's blocks.
  private calculateSoloOdds(chartData: any[], clientInfo: any, networkInfo: any) {
    const recent = (chartData ?? [])
      .filter((point: any) => point.payoutMode === 'solo')
      .slice(-ODDS_AVERAGE_POINTS)
      .map((point: any) => Number(point.data))
      .filter(value => value > 0);
    const averaged = recent.length > 0;
    const hashRate = averaged
      ? recent.reduce((sum: number, value: number) => sum + value, 0) / recent.length
      : this.getSoloHashRate(clientInfo?.workers ?? []);
    const difficulty = networkInfo.difficulty;
    const oddsFor = (label: string, seconds: number) => {
      const chance = chanceWithin(hashRate, difficulty, seconds);
      return { label, percent: formatPercent(chance), oneIn: formatOneIn(chance) };
    };
    return {
      chain: CHAIN_NAMES[networkInfo.chain] ?? networkInfo.chain,
      hashRate,
      hashRateSource: averaged ? `${recent.length * CHART_POINT_MINUTES} min avg` : 'current',
      windows: [
        oddsFor('Per block', SECONDS_PER_BLOCK),
        oddsFor('Per day', SECONDS_PER_DAY),
        oddsFor('Per month', SECONDS_PER_MONTH),
        oddsFor('Per year', SECONDS_PER_YEAR)
      ],
      expected: formatDuration(expectedSeconds(hashRate, difficulty))
    };
  }

  private getSoloHashRate(workers: any[]) {
    return workers
      .filter(worker => worker.payoutMode !== 'pplns')
      .reduce((sum, worker) => sum + (Number(worker.hashRate) || 0), 0);
  }

  public getDailySoloChance(name: string, workers: any[], difficulty: number) {
    const hashRate = this.getSoloHashRate(workers.filter(worker => worker.name === name));
    if (hashRate <= 0) {
      return '—';
    }
    const chance = chanceWithin(hashRate, difficulty, SECONDS_PER_DAY);
    return `${formatPercent(chance)} (${formatOneIn(chance)})`;
  }

  public getBestDifficultyPercent(bestDifficulty: number, difficulty: number) {
    return formatPercent(difficulty > 0 ? bestDifficulty / difficulty : 0);
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
      creditedWork: point.shares,
      payoutMode: point.payoutMode
    };
  }

  private toPayoutModeDatasets(chartData: any[], modes: Record<string, { label: string; borderColor: string; backgroundColor: any; }>) {
    return Object.entries(modes)
      .map(([mode, config]) => {
        const rows = chartData.filter(point => point.payoutMode === mode);

        return {
          type: 'line',
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

  public getWorkerPayoutModes(name: string, workers: any[]): string[] {
    const modes = workers
      .filter(worker => worker.name === name)
      .map(worker => worker.payoutMode)
      .filter(mode => mode != null);
    return [...new Set(modes)];
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
