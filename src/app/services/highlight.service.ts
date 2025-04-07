// import { Injectable } from '@angular/core';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class HighlightService {
//   private highlightText: string = '';
//   private highlights: string[] = [];
//
//   setHighlight(text: string) {
//     this.highlightText = text;
//   }
//
//   getHighlight(): string {
//     return this.highlightText;
//   }
//
//   addHighlight(text: string) {
//     this.highlights.push(text);
//   }
//
//   getHighlights(): string[] {
//     return this.highlights;
//   }
// }


// typescript in src/app/services/highlight.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  private highlights: [number, number][] = [];

  addHighlight(range: [number, number]) {
    this.highlights.push(range);
  }

  getHighlights(): [number, number][] {
    return this.highlights;
  }
}
