import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  constructor() { }

  get apiUrl(): string {
    return `http://${window.location.hostname}:2019`;
  }

  get stratumUrl(): string {
    return `${window.location.hostname}:2018`;
  }
}
