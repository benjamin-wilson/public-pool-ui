import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { map, Observable, shareReplay, switchMap, timer, distinctUntilChanged, forkJoin } from 'rxjs';

import { HashSuffixPipe } from '../../pipes/hash-suffix.pipe';
import { AppService } from '../../services/app.service';
import { ClientService } from '../../services/client.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  public clientInfo$: Observable<any>;
  public chartData$: Observable<any>;
  public networkInfo$: Observable<any>;
  public expandedRows$: Observable<any>;

  public chartOptions: any;

  @ViewChild('dataTable') dataTable!: Table;

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private appService: AppService
  ) {
    const address = this.route.snapshot.params['address'];
    const cssVars = this.getCssVars([
      '--text-color',
      '--primary-color',
      '--text-color-secondary',
      '--surface-border',
      '--yellow-600'
    ]);

    const combined$ = timer(0, 60_000).pipe(
      switchMap(() =>
        forkJoin({
          networkInfo: this.appService.getNetworkInfo(),
          clientInfo: this.clientService.getClientInfo(address)
        })
      ),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.networkInfo$ = combined$.pipe(
      map(result => result.networkInfo),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );

    this.clientInfo$ = combined$.pipe(
      map(result => result.clientInfo),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );

    this.expandedRows$ = this.clientInfo$.pipe(map((info: any) =>
      Object.fromEntries((info.workers ?? []).map((worker: any) => [worker.name, true]))
    ));

    this.chartData$ = timer(0, 600_000).pipe(
      switchMap(() => this.clientService.getClientInfoChart(address)),
      map((chartData: any[]) => {
        const GROUP_SIZE = 12; // 6 = 1 hour

        let hourlyData = [];

        for (let i = GROUP_SIZE; i < chartData.length; i += GROUP_SIZE) {
          let sum = 0;
          for (let j = GROUP_SIZE - 1; j >= 0; j--) {
            sum += parseInt(chartData[i - j].data);
          }
          sum = sum / GROUP_SIZE;
          hourlyData.push({ y: sum, x: chartData[i].label });
        }

        const data = chartData.map((d: any) => ({ y: d.data, x: d.label }));

        return {
          labels: chartData.map((d: any) => d.label),
          datasets: [
            {
              type: 'line',
              label: '2 Hour',
              data: hourlyData,
              fill: false,
              backgroundColor: cssVars['yellow600'],
              borderColor: cssVars['yellow600'],
              tension: .4,
              pointRadius: 1,
              borderWidth: 1
            },
            {
              type: 'line',
              label: '10 Minute',
              data: data,
              fill: false,
              backgroundColor: cssVars['primaryColor'],
              borderColor: cssVars['primaryColor'],
              tension: .4,
              pointRadius: 1,
              borderWidth: 1
            }
          ]
        };
      }),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: cssVars['textColor']
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
            color: cssVars['textColorSecondary']
          },
          grid: {
            color: cssVars['surfaceBorder'],
            drawBorder: false,
            display: true
          }
        },
        y: {
          ticks: {
            color: cssVars['textColorSecondary'],
            callback: (value: number) => HashSuffixPipe.transform(value)
          },
          grid: {
            color: cssVars['surfaceBorder'],
            drawBorder: false
          }
        }
      }
    };

  }

  private getCssVars(varNames: string[]): Record<string, string> {
    const documentStyle = getComputedStyle(document.documentElement);

    return varNames.reduce((vars, name) => {
      const key = name.replace(/^--/, '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
      vars[key] = documentStyle.getPropertyValue(name).trim();
      return vars;
    }, {} as Record<string, string>);
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
}
