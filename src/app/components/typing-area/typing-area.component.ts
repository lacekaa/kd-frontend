import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeystrokeTrackerService } from '../../services/keystroke-tracker.service';
import { HighlightService } from '../../services/highlight.service';

@Component({
  selector: 'app-typing-area',
  standalone: true,
  templateUrl: './typing-area.component.html',
  styleUrls: ['./typing-area.component.css'],
  imports: [CommonModule],
})
export class TypingAreaComponent implements OnInit {
  @ViewChild('typingArea') typingArea!: ElementRef<HTMLTextAreaElement>;
  prompt: string = 'Type this sentence to record keystroke data.';
  keystrokes: any[] = [];
  submitted: boolean = false;
  errorMessage: string = '';

  constructor(
    private keystrokeTrackerService: KeystrokeTrackerService,
    private highlightService: HighlightService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const submissionStatus = sessionStorage.getItem('submitted');
    if (submissionStatus === 'true') {
      this.router.navigate(['/thank-you']);
    }
    this.keystrokeTrackerService.setPrompt(this.prompt);
  }

  onKeyDown(event: KeyboardEvent) {
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.keystrokeTrackerService.trackKeydown(event);
  }

  onKeyUp(event: KeyboardEvent) {
    this.keystrokeTrackerService.trackKeyup(event);
  }

  onTextSelection() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      this.highlightService.addHighlight(selection.toString());
      this.errorMessage = '';
    }
  }

  sendKeystrokes() {
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
  }

  finalizeSubmission() {
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    const highlights: string[] = this.highlightService.getHighlights();
    if (!highlights || highlights.length === 0) {
      this.errorMessage = 'Highlight at least one part of the text before final submission';
      return;
    }
    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
    // Aktualisieren aller Keystrokes mit dem finalen Prompt
    this.keystrokes.forEach(keystroke => {
      keystroke.prompt = currentPrompt;
    });
    const uniqueParticipantId = this.keystrokeTrackerService.getParticipantId();
    const payload = {
      participantId: uniqueParticipantId,
      prompt: currentPrompt,
      highlights: highlights,
      keystrokes: this.keystrokes,
    };
    console.log('Payload to be sent:', payload);
    this.keystrokeTrackerService.resetKeystrokes();
    sessionStorage.setItem('submitted', 'true');
    this.submitted = true;
    this.router.navigate(['/thank-you']);
  }
}
