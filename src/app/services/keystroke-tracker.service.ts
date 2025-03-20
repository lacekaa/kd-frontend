import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Keystroke } from '../keystroke.model';

@Injectable({
  providedIn: 'root',
})
export class KeystrokeTrackerService {
  private keystrokes: Keystroke[] = [];
  private keystrokeIdCounter = 1;
  private participantId = 10001; // Set dynamically if needed
  private prompt = ''; // Will be set when the prompt is given
  private highlight = ''; // Will be set when the user highlights text

  keystrokesUpdated = new Subject<Keystroke[]>();

  constructor() {}

  setPrompt(prompt: string) {
    this.prompt = prompt;
  }

  setHighlight(highlight: string) {
    this.highlight = highlight;
  }

  trackKeydown(event: KeyboardEvent) {
    const pressTime = Date.now();
    this.keystrokes.push(
      new Keystroke(
        this.participantId,
        this.prompt,
        this.highlight,
        this.keystrokeIdCounter++,
        pressTime,
        0,
        event.key,
        event.keyCode
      )
    );
  }

  trackKeyup(event: KeyboardEvent) {
    const releaseTime = Date.now();
    const keystroke = this.keystrokes.find(
      (ks) => ks.keycode === event.keyCode && ks.releaseTime === 0
    );
    if (keystroke) {
      keystroke.releaseTime = releaseTime;
      this.keystrokesUpdated.next([...this.keystrokes]);
    }
  }

  getKeystrokes() {
    return [...this.keystrokes];
  }

  resetKeystrokes() {
    this.keystrokes = [];
    this.keystrokeIdCounter = 1;
  }
}
