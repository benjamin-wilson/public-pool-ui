import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';

import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {


  public clientInfo$: Observable<any>;
  public chartData$: Observable<any>;

  public chartOptions: any;

  constructor(private clientService: ClientService, private route: ActivatedRoute) {
    const address = this.route.snapshot.params['address'];
    this.clientInfo$ = this.clientService.getClientInfo(address).pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    )


    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');



    this.chartData$ = this.clientInfo$.pipe(
      map((workerInfo: any) => {

        return {
          labels: workerInfo.chartData.map((d: any) => d.label),
          datasets: [
            {
              label: address,
              data: workerInfo.chartData.map((d: any) => d.data),
              fill: false,
              backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
              borderColor: documentStyle.getPropertyValue('--bluegray-700'),
              tension: .4
            }
          ]
        }
      })
    );



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
            unit: 'minute', // Set the unit to 'minute'
            stepSize: 10, // Set the desired interval between labels in minutes

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
            callback: (value: number) => value + ' GH/s',
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

  }


  public getSessionCount(name: string, workers: any[]) {
    const workersByName = workers.filter(w => w.name == name);
    return workersByName.length;
  }

  public getTotalHashRate(name: string, workers: any[]) {
    const workersByName = workers.filter(w => w.name == name);
    const sum = workersByName.reduce((pre, cur, idx, arr) => {
      return pre += cur.hashRate;
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
