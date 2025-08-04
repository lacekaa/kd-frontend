import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  private highlights: [number, number][] = [];
  private lowLights: [number, number][] = [];
  private combinedEntries: { type: 'highlight' | 'lowlight'; range: [number, number] }[] = [];


  addHighlight(range: [number, number]) {
    if (!this.highlights.some(([start, end]) => start === range[0] && end === range[1])) {
      this.highlights.push(range);
      this.combinedEntries.push({ type: 'highlight', range });
    }
  }

  addLowlight(range: [number, number]) {
    if (!this.lowLights.some(([start, end]) => start === range[0] && end === range[1])) {
      this.lowLights.push(range);
      this.combinedEntries.push({ type: 'lowlight', range });
    }
  }

  removeLastCombinedEntry() {
    const lastEntry = this.combinedEntries.pop();
    if (lastEntry) {
      if (lastEntry.type === 'highlight') {
        this.highlights.pop();
      } else if (lastEntry.type === 'lowlight') {
        this.lowLights.pop();
      }
    }
    return lastEntry;
  }

  getCombinedEntries() {
    return this.combinedEntries;
  }

  getHighlights(): [number, number][] {
    return this.highlights;
  }

  getLowlights(): [number, number][] {
    return this.lowLights;
  }

  clearHighlights() {
    this.highlights = [];
  }

  clearLowlights() {
    this.lowLights = [];
  }

  removeLastHighlight() {
    if (this.highlights.length > 0) {
      this.highlights.pop();
    }
  }

  removeLastLowlight() {
    if (this.lowLights.length > 0) {
      this.lowLights.pop();
    }
  }
}
