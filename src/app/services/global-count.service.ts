import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalCountService {

  constructor() { }

  private globalCount: number = 0;

  incrementCount(): void {
    this.globalCount++;
  }

  getCount(): number {
    return this.globalCount;
  }
}
