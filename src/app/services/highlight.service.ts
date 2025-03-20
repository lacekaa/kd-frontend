import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  private highlightText: string = '';

  setHighlight(text: string) {
    this.highlightText = text;
  }

  getHighlight(): string {
    return this.highlightText;
  }
}
