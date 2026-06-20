import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SplashComponent } from './components/splash/splash.component';
import { TermsComponent } from './components/terms/terms.component';
import { WorkerGroupComponent } from './components/worker-group/worker-group.component';
import { WorkerComponent } from './components/worker/worker.component';
import { AppLayoutComponent } from './layout/app.layout.component';

const routes: Routes = [
  {
    path: '',
    component: SplashComponent
  },
  {
    path: 'terms',
    component: TermsComponent
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    children: [
      {
        path: ':address',
        children: [
          {
            path: 'settings',
            component: SettingsComponent
          },
          {
            path: '',
            component: DashboardComponent,
          },
          {
            path: ':workerName',
            children: [

              {
                path: '',
                component: WorkerGroupComponent
              },
              {
                path: ':workerId',
                component: WorkerComponent
              }
            ]
          },


        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
