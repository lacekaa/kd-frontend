// import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { KeystrokeTrackerService } from '../../services/keystroke-tracker.service';
// import { HighlightService } from '../../services/highlight.service';
// import { DataProcessingService, PayloadModel } from '../../services/data-processing.service';
// import {FormsModule} from '@angular/forms';
//
// @Component({
//   selector: 'app-typing-area',
//   standalone: true,
//   templateUrl: './typing-area.component.html',
//   styleUrls: ['./typing-area.component.css'],
//   imports: [CommonModule, FormsModule],
// })
// export class TypingAreaComponent implements OnInit {
//   @ViewChild('typingArea') typingArea!: ElementRef<HTMLTextAreaElement>;
//   prompt: string = '';
//   keystrokes: any[] = [];
//   submitted: boolean = false;
//   errorMessage: string = '';
//   promptLocked: boolean = false;
//   highlights: [number, number][] = []; // Array to store highlight ranges
//
//   constructor(
//     private keystrokeTrackerService: KeystrokeTrackerService,
//     private highlightService: HighlightService,
//     private router: Router,
//     private dataProcessingService: DataProcessingService
//   ) {}
//
//   ngOnInit(): void {
//     const submissionStatus = sessionStorage.getItem('submitted');
//     if (submissionStatus === 'true') {
//       this.router.navigate(['/thank-you']);
//     }
//     this.keystrokeTrackerService.setPrompt(this.prompt);
//   }
//
//   getHighlightRanges(): [number, number][] {
//     return this.highlightService.getHighlights();
//   }
//
//   lockPrompt() {
//     this.promptLocked = true;
//     const currentPrompt = this.typingArea.nativeElement.value;
//     this.keystrokeTrackerService.setPrompt(currentPrompt);
//     this.prompt = currentPrompt;
//   }
//
//   getColorClass(index: number): string {
//     for (const [start, end] of this.highlights) {
//       if (index >= start && index < end) {
//         return 'red';
//       }
//     }
//     return 'black';
//   }
//
//   onKeyDown(event: KeyboardEvent) {
//     if (this.promptLocked) {
//       return;
//     }
//     const currentPrompt = this.typingArea.nativeElement.value;
//     this.keystrokeTrackerService.setPrompt(currentPrompt);
//     this.keystrokeTrackerService.trackKeydown(event);
//   }
//
//   onKeyUp(event: KeyboardEvent) {
//     if (this.promptLocked) {
//       return;
//     }
//     this.keystrokeTrackerService.trackKeyup(event);
//   }
//
//   onTextSelection() {
//     if (!this.promptLocked) {
//       this.errorMessage = 'Bitte den Prompt zuerst festlegen.';
//       return;
//     }
//     const textarea = this.typingArea.nativeElement;
//     const startIdx = textarea.selectionStart;
//     const endIdx = textarea.selectionEnd;
//     if (startIdx === endIdx) {
//       return;
//     }
//     // Speichern des Highlight-Bereichs als Tuple von Keystroke_IDs
//     this.highlightService.addHighlight([startIdx, endIdx]);
//     this.highlights = this.highlightService.getHighlights();
//     this.errorMessage = '';
//   }
//
//   sendKeystrokes() {
//     const currentPrompt = this.typingArea.nativeElement.value;
//     this.keystrokeTrackerService.setPrompt(currentPrompt);
//     this.prompt = currentPrompt;
//     this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
//   }
//
//   finalizeSubmission() {
//     const currentPrompt = this.typingArea.nativeElement.value;
//     this.keystrokeTrackerService.setPrompt(currentPrompt);
//     const highlights: [number, number][] = this.highlightService.getHighlights();
//     if (!highlights || highlights.length === 0) {
//       this.errorMessage = 'Bitte mindestens einen Highlight-Bereich festlegen, bevor Sie abschicken.';
//       return;
//     }
//     this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
//     this.keystrokes.forEach((keystroke) => {
//       keystroke.prompt = currentPrompt;
//     });
//     const uniqueParticipantId = this.keystrokeTrackerService.getParticipantId();
//     const payload: PayloadModel = {
//       participantId: uniqueParticipantId,
//       prompt: currentPrompt,
//       highlights: highlights,
//       keystrokes: this.keystrokes,
//     };
//
//     console.log('Payload being sent to the backend:', payload);
//
//     this.dataProcessingService.submitPayload(payload).subscribe({
//       next: (response) => {
//         console.log('Response from backend:', response);
//         this.keystrokeTrackerService.resetKeystrokes();
//         sessionStorage.setItem('submitted', 'true');
//         this.submitted = true;
//         this.router.navigate(['/thank-you']);
//       },
//       error: (err) => {
//         console.error('Error submitting payload:', err);
//       },
//     });
//   }
// }


import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeystrokeTrackerService } from '../../services/keystroke-tracker.service';
import { HighlightService } from '../../services/highlight.service';
import { DataProcessingService, PayloadModel } from '../../services/data-processing.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-typing-area',
  standalone: true,
  templateUrl: './typing-area.component.html',
  styleUrls: ['./typing-area.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TypingAreaComponent implements OnInit {
  @ViewChild('typingArea') typingArea!: ElementRef<HTMLTextAreaElement>;
  prompt: string = '';
  keystrokes: any[] = [];
  submitted: boolean = false;
  errorMessage: string = '';
  promptLocked: boolean = false;
  highlights: [number, number][] = []; // Array to store highlight ranges

  constructor(
    private keystrokeTrackerService: KeystrokeTrackerService,
    private highlightService: HighlightService,
    private router: Router,
    private dataProcessingService: DataProcessingService
  ) {}

  ngOnInit(): void {
    const submissionStatus = sessionStorage.getItem('submitted');
    if (submissionStatus === 'true') {
      this.router.navigate(['/thank-you']);
    }
    this.keystrokeTrackerService.setPrompt(this.prompt);
  }

  getHighlightRanges(): [number, number][] {
    return this.highlightService.getHighlights();
  }

  lockPrompt() {
    const currentPrompt = this.typingArea.nativeElement.value;
    if (currentPrompt.length < 10) {
      this.errorMessage = 'Prompt too short';
      return;
    }
    this.promptLocked = true;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.prompt = currentPrompt;
    this.errorMessage = ''; // Clear any previous error message
  }

  getColorClass(index: number): string {
    for (const [start, end] of this.highlights) {
      if (index >= start && index < end) {
        return 'red';
      }
    }
    return 'black';
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.promptLocked) {
      return;
    }
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.keystrokeTrackerService.trackKeydown(event);
  }

  onKeyUp(event: KeyboardEvent) {
    if (this.promptLocked) {
      return;
    }
    this.keystrokeTrackerService.trackKeyup(event);
  }

  onTextSelection() {
    if (!this.promptLocked) {
      this.errorMessage = 'Bitte den Prompt zuerst festlegen.';
      return;
    }
    const textarea = this.typingArea.nativeElement;
    const startIdx = textarea.selectionStart;
    const endIdx = textarea.selectionEnd;
    if (startIdx === endIdx) {
      return;
    }
    this.highlightService.addHighlight([startIdx, endIdx]);
    this.highlights = this.highlightService.getHighlights();
    this.errorMessage = '';
  }

  sendKeystrokes() {
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.prompt = currentPrompt;
    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
  }

  finalizeSubmission() {
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    const highlights: [number, number][] = this.highlightService.getHighlights();
    if (!highlights || highlights.length === 0) {
      this.errorMessage = 'Bitte mindestens einen Highlight-Bereich festlegen, bevor Sie abschicken.';
      return;
    }
    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
    this.keystrokes.forEach((keystroke) => {
      keystroke.prompt = currentPrompt;
    });
    const uniqueParticipantId = this.keystrokeTrackerService.getParticipantId();
    const payload: PayloadModel = {
      participantId: uniqueParticipantId,
      prompt: currentPrompt,
      highlights: highlights,
      keystrokes: this.keystrokes,
    };

    console.log('Payload being sent to the backend:', payload);

    this.dataProcessingService.submitPayload(payload).subscribe({
      next: (response) => {
        console.log('Response from backend:', response);
        this.keystrokeTrackerService.resetKeystrokes();
        sessionStorage.setItem('submitted', 'true');
        this.submitted = true;
        this.router.navigate(['/thank-you']);
      },
      error: (err) => {
        console.error('Error submitting payload:', err);
      },
    });
  }
}
