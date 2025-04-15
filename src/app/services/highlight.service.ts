import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  private highlights: [number, number][] = [];
  private lowLights: [number, number][] = [];

  addHighlight(range: [number, number]) {
    if (!this.highlights.some(([start, end]) => start === range[0] && end === range[1])) {
      this.highlights.push(range);
    }
  }

  addLowlight(range: [number, number]) {
    if (!this.lowLights.some(([start, end]) => start === range[0] && end === range[1])) {
      this.lowLights.push(range);
    }
  }

  getHighlights(): [number, number][] {
    return this.highlights;
  }

  getLowlights(): [number, number][] {
    return this.lowLights;
  }
}
