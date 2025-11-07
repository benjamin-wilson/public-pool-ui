import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import { HashSuffixPipe } from '../../pipes/hash-suffix.pipe';
import { WorkerService } from '../../services/worker.service';
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

        return {
          labels: workerInfo.chartData.map((d: any) => d.label),
          datasets: [
            {
              label: workerInfo.name,
              data: workerInfo.chartData.map((d: any) => d.data),
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



}
