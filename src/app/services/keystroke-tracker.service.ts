import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Keystroke } from '../keystroke.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class KeystrokeTrackerService {
  private keystrokes: Keystroke[] = [];
  private keystrokeIdCounter = 1;
  // Initialize participantId as a new UUID
  private participantId: string = uuidv4();
  private prompt = ''; // Will be set when the prompt is given
  private highlight = ''; // Will be set when the user highlights text
  private highlights: string[] = []; // Array to store highlights

  keystrokesUpdated = new Subject<Keystroke[]>();

  constructor() {}

  setId(participantId: string) {
    this.participantId = participantId;
  }

  setPrompt(prompt: string) {
    this.prompt = prompt;
  }

  setHighlight(highlight: string) {
    this.highlight = highlight;
  }

  addHighlight(highlight: string) {
    this.highlights.push(highlight);
  }

  trackKeydown(event: KeyboardEvent) {
    const pressTime = Date.now();
    this.keystrokes.push(
      new Keystroke(
        this.participantId,
        this.prompt,
        this.highlight,
        this.highlights,
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
