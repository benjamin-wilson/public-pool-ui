import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { SplashComponent } from './splash/splash.component';

const routes: Routes = [
  {
    path: '',
    component: SplashComponent
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
