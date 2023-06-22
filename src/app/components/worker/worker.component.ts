import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';

import { WorkerService } from '../../services/worker.service';

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.scss']
})
export class WorkerComponent {

  public workerInfo$: Observable<any>;

  public chartData$: Observable<any>;

  public chartOptions: any;

  constructor(private workerService: WorkerService, private route: ActivatedRoute) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.workerInfo$ = this.workerService.getWorkerInfo(this.route.snapshot.params['address'], this.route.snapshot.params['workerId']).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.chartData$ = this.workerInfo$.pipe(
      map((workerInfo: any) => {

        const GROUP_SIZE = 60;
        const slice = workerInfo.hashData.length % GROUP_SIZE == 0 ? workerInfo.hashData : workerInfo.hashData.slice(0, workerInfo.hashData.length - workerInfo.hashData.length % GROUP_SIZE)
        const reducedData = ((slice as any[])
          .reduce((pre, cur, idx, arr) => {
            if (idx % GROUP_SIZE != 0) {
              pre[pre.length - 1].difficulty += cur.difficulty;
            } else {
              pre.push(cur);
            }
            return pre;
          }, []) as any[]);

        const labels = reducedData.reduce((pre, cur, idx, arr) => {
          if (idx == 0) {
            return pre;
          }
          pre.push(new Date(cur.time));
          return pre;
        }, []);

        const data = reducedData
          .reduce((pre, cur, idx, arr) => {
            if (idx == 0) {
              return pre;
            }
            //hashrate = (nonce_difficulty * 2^32) / time_to_find
            pre.push((cur.difficulty * 4294967296 / (new Date(cur.time).getTime() - new Date(arr[idx - 1].time).getTime())) / 1000000);
            return pre;

          }, []);
        return {
          labels,
          datasets: [
            {
              label: workerInfo.name,
              data,
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



}
