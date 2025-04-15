// // typescript
// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';
// import { Keystroke } from '../keystroke.model';
// import { v4 as uuidv4 } from 'uuid';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class KeystrokeTrackerService {
//   private keystrokes: Keystroke[] = [];
//   private keystrokeIdCounter = 1;
//   // participantId wird hier initialisiert. Wird im Registrierungsprozess ersetzt.
//   private participantId: string = uuidv4();
//   private prompt = '';
//   private highlights: string[] = [];
//   keystrokesUpdated = new Subject<Keystroke[]>();
//
//   constructor() {}
//
//   setId(participantId: string) {
//     this.participantId = participantId;
//   }
//
//   // Neuer Getter für participantId
//   getParticipantId(): string {
//     return this.participantId;
//   }
//
//   setPrompt(prompt: string) {
//     this.prompt = prompt;
//   }
//
//   addHighlight(highlight: string) {
//     this.highlights.push(highlight);
//   }
//
//   trackKeydown(event: KeyboardEvent) {
//     const pressTime = Date.now();
//     this.keystrokes.push(
//       new Keystroke(
//         this.participantId,
//         this.prompt,
//         this.highlights,
//         this.keystrokeIdCounter++,
//         pressTime,
//         0,
//         event.key,
//         event.keyCode
//       )
//     );
//   }
//
//   trackKeyup(event: KeyboardEvent) {
//     const releaseTime = Date.now();
//     const keystroke = this.keystrokes.find(
//       (ks) => ks.keycode === event.keyCode && ks.releaseTime === 0
//     );
//     if (keystroke) {
//       keystroke.releaseTime = releaseTime;
//       this.keystrokesUpdated.next([...this.keystrokes]);
//     }
//   }
//
//   getKeystrokes() {
//     return [...this.keystrokes];
//   }
//
//   resetKeystrokes() {
//     this.keystrokes = [];
//     this.keystrokeIdCounter = 1;
//   }
// }

// typescript in src/app/services/keystroke-tracker.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Keystroke } from '../keystroke.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class KeystrokeTrackerService {
  private keystrokes: Keystroke[] = [];
  private keystrokeIdCounter = 0; // Startet jetzt bei 0
  private participantId: string = uuidv4();
  private prompt = '';
  private highlights: [number, number][] = [];
  private lowlights: [number, number][] = [];
  keystrokesUpdated = new Subject<Keystroke[]>();

  constructor() {}

  setId(participantId: string) {
    this.participantId = participantId;
  }

  getParticipantId(): string {
    return this.participantId;
  }

  setPrompt(prompt: string) {
    this.prompt = prompt;
  }

  addHighlight(highlight: [number, number]) {
    this.highlights.push(highlight);
  }

  trackKeydown(event: KeyboardEvent) {
    const pressTime = Date.now();
    this.keystrokes.push(
      new Keystroke(
        this.participantId,
        this.prompt,
        this.highlights,
        this.lowlights,
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
    this.keystrokeIdCounter = 0;
  }
}
