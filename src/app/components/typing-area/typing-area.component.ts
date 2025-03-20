// typing-area.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeystrokeTrackerService } from '../../services/keystroke-tracker.service';
import { HighlightService } from '../../services/highlight.service';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-typing-area',
  standalone: true,
  templateUrl: './typing-area.component.html',
  styleUrls: ['./typing-area.component.css'],
  imports: [CommonModule],
})
export class TypingAreaComponent implements OnInit {
  @ViewChild('typingArea') typingArea!: ElementRef<HTMLTextAreaElement>;
  // The default prompt is still available but will be replaced once the user types something.
  prompt: string = 'Type this sentence to record keystroke data.';
  keystrokes: any[] = [];

  // Flag to track whether submission has occurred
  submitted: boolean = false;
  // Message to show errors like highlight not provided
  errorMessage: string = '';

  constructor(
    private keystrokeTrackerService: KeystrokeTrackerService,
    private highlightService: HighlightService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If you decide to persist submission status (e.g., in session storage),
    // you could check for that here and redirect immediately.
    const submissionStatus = sessionStorage.getItem('submitted');
    if (submissionStatus === 'true') {
      this.router.navigate(['/thank-you']);
    }

    // Initialize the prompt in the tracker service
    this.keystrokeTrackerService.setPrompt(this.prompt);
  }

  onKeyDown(event: KeyboardEvent) {
    this.keystrokeTrackerService.trackKeydown(event);
  }

  onKeyUp(event: KeyboardEvent) {
    this.keystrokeTrackerService.trackKeyup(event);
  }

  onTextSelection() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      this.highlightService.setHighlight(selection.toString());
      // Clear any previous error message once a highlight is provided.
      this.errorMessage = '';
    }
  }

  /**
   * Capture and log keystrokes. Ensure that:
   * - A highlight has been provided
   * - Submission can only occur once (both by button and via URL reload)
   * After successful submission, the user is redirected to a "thank you" page.
   *
   * When your backend is ready, you can uncomment the HTTP code.
   */
  sendKeystrokes() {
    // Prevent duplicate submissions
    if (this.submitted) {
      return;
    }

    // Read the current value of the textarea as the prompt
    const currentPrompt = this.typingArea.nativeElement.value;
    // Update prompt in service
    this.keystrokeTrackerService.setPrompt(currentPrompt);

    // Retrieve any highlighted text
    const highlight = this.highlightService.getHighlight();

    // Ensure the user has highlighted text before submission.
    if (!highlight || highlight.trim().length === 0) {
      this.errorMessage = 'Please highlight the most important part of your prompt and submit.';
      return;
    }

    // Assemble the payload for submission.
    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();

    const uniqueParticipantId = uuidv4();

    const payload = {
      participantId: uniqueParticipantId,
      prompt: currentPrompt,
      highlight: highlight,
      keystrokes: this.keystrokes,
    };

    console.log('Payload to be sent:', payload);

    // Uncomment and configure this HTTP call for backend integration:
    /*
    this.http.post('http://your-backend.com/keystrokes', payload).subscribe(
      (response) => {
        console.log('Data sent successfully:', response);
      },
      (error) => {
        console.error('Error sending data:', error);
      }
    );
    */

    // Mark as submitted to prevent further submissions
    this.submitted = true;
    // Optionally, store the submitted state in session storage to prevent re-submission via URL reload.
    sessionStorage.setItem('submitted', 'true');

    // Redirect the user to a thank-you page.
    this.router.navigate(['/thank-you']);

    // Reset tracked keystrokes if needed
    this.keystrokeTrackerService.resetKeystrokes();
  }
}
