import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  private highlightText: string = '';
  private highlights: string[] = [];

  setHighlight(text: string) {
    this.highlightText = text;
  }

  getHighlight(): string {
    return this.highlightText;
  }

  addHighlight(text: string) {
    this.highlights.push(text);
  }

  getHighlights(): string[] {
    return this.highlights;
  }
}
